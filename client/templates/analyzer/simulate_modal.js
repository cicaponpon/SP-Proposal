import Highcharts from 'highcharts';
  initialIncome = 0;
  Template.simulateFormTemplate.events({
     'click #simulate': function(event){
            event.preventDefault();
            $('#signalModal').modal('hide');
            $('#simulateForm').modal('hide');
            $('#simulateModal').modal({backdrop: 'static', keyboard: false});

            initialIncome = Number(document.getElementById("init_income").value);
            var numShares = Number(document.getElementById("num_shares").value);
       
            for(var j=1;j<=5;j++)
                Session.set('income'+j,'none');

            var index = Session.get('choseInd');
            for(var i=0;i<index.length;i++){
                var pass= [Session.get('tradeSignal'+ index[i]), Session.get('tradePrice'+ index[i]), index[i], numShares,initialIncome];
                
                Meteor.call('getPrice',pass,function (error, n) {
                    var indexV= n[0];
                    Session.set('income'+indexV, n[1]);
                    var passIncome= [n[2], n[1], indexV];
                   
                    Meteor.call('getTotal',passIncome, function (error, m) {
                                var indexT= n=m[0];
                                Session.set('total'+indexT, m[1]);
                    });

                });    
            }


        }
  });
  Template.signalModalTemplate.events({
        'click #simulate-trigger': function(event){
            event.preventDefault();
            document.getElementById("simulateF").reset();
            $('#simulateForm').modal('show');
        },
       
        
  });
Template.simulateModalTemplate.helpers({
    createSChart: function () {

        // Gather data: 
            var tech =["ADL","MOM","MACD","OBV","STO"];            
            var techName = [],techInitial = [],techIncome =[],total_inc = [],final_inc = 0;

            
            for(var i = 1; i <= 5; i++) {
                total_inc = [];
                if(Session.get('income'+i) != 'none'){
                    total_inc = Session.get('total'+i);
                    if(total_inc.length>0)final_inc = Number(total_inc[total_inc.length-1]);
                    techIncome.push(final_inc);
                    techName.push(tech[i-1]);
                    techInitial.push(initialIncome);
                }
            }
      // Use Meteor.defer() to craete chart after DOM is ready:
      Meteor.defer(function() {
        // Create standard Highcharts chart with options:
        Highcharts.chart('Schart', {
             chart: {
                type: 'bar'
            },
            title: {
                text: 'Income Status',
                 style: {
                    fontWeight: 'bold'
                 }
                }, 
             xAxis: {
                        categories: techName
                    },
             yAxis: {
                  min: 0,
                  title: {
                     text: 'Income',
                     align: 'high'
                  },
                  labels: {
                     overflow: 'justify'
                  }
             },
            plotOptions: {
                  bar: {
                     dataLabels: {
                        enabled: true
                     }
                  }
               },
             legend: {
                  layout: 'vertical',
                  align: 'right',
                  verticalAlign: 'top',
                  x: -40,
                  y: 100,
                  floating: true,
                  borderWidth: 1,
                  backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                  shadow: true
               },
            credits: {
                  enabled: false
               },
            series:  [{
                        name: 'Initial Income',
                        data: techInitial
                    }, {
                        name: 'Final Income',
                        data: techIncome
                    }]
        });
        console.log(techIncome);
      });

    },
    simulate: function() {  
        var name = ["ADLsim","MOMsim","MACDsim","OBVsim","STOsim"]; 
        var tech =["Accumulation/ Distribution Line (ADL)","Momentum (MOM)" , "Moving Average Convergence Divergence (MACD)", "On-Balance Volume (OBV)" , "Stochastics (STO)"];           
        var data = [];
        var active = 1;
        var index = 0;

        for(var i = 1; i <= 5; i++) {
        var totalIncome = [];
        var Income = [];
          if(Session.get('income'+i) != 'none'){
            totalIncome = Session.get('total'+i);
            Income = Session.get('income'+i);

                for(var ti=0;ti < Income.length;ti++)
                    Income[ti] = Income[ti].toFixed(2);
                for(var tn=0;tn < totalIncome.length;tn++)
                    totalIncome[tn] = totalIncome[tn].toFixed(2);

            if(active==1){
                data.push({ch:"checked",rnav:"Srnav "+name[i-1],slide:"Sslide_"+i,sindex:"Ss-index "+name[i-1]+"-label",box:"Sbox "+name[i-1],indicator:tech[i-1],date:trDate[index],signal:trSignal[index],price:trPrice[index],income:Income,total:totalIncome});
                active = 0;
            }
            else data.push({ch:"",rnav:"Srnav "+name[i-1],slide:"Sslide_"+i,sindex:"Ss-index "+name[i-1]+"-label",box:"Sbox "+name[i-1],indicator:tech[i-1],date:trDate[index],signal:trSignal[index],price:trPrice[index],income:Income,total:totalIncome});
            index ++;
          }
        }
        return data;
    }
  });
