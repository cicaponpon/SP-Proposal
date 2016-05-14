import Highcharts from 'highcharts';
T_initialIncome = 0;
  Template.simTableFormTemplate.events({
     'click #simulateT': function(event){
            event.preventDefault();
            T_initialIncome = Number(document.getElementById("Tinit_income").value);
            var numShares = Number(document.getElementById("Tnum_shares").value);
            $('#outputModal').modal('hide');
            $('#simTableForm').modal('hide');
            $('#simTableModal').modal({backdrop: 'static', keyboard: false});

            for(var j=1;j<=5;j++)
                Session.set('T_income'+j,'none');

            var index = Session.get('TchoseInd');
            for(var i=0;i<index.length;i++){
                var pass= [Session.get('T_tradeSignal'+ index[i]), Session.get('T_tradePrice'+ index[i]), index[i], numShares,initialIncome];
                
                Meteor.call('getPrice',pass,function (error, n) {
                    var indexV= n[0];
                    Session.set('T_income'+indexV, n[1]);
                    var passIncome= [n[2], n[1], indexV];
                    
                    Meteor.call('getTotal',passIncome, function (error, m) {
                                var indexT= n=m[0];
                                Session.set('T_total'+indexT, m[1]);
                    });

                });    
            }
        }
  });
  Template.outputModalTemplate.events({
        'click #simTable-trigger': function(event){
            event.preventDefault();
            document.getElementById("simTableF").reset();
            $('#simTableForm').modal('show');
        },
       
        
  });
Template.simTableModalTemplate.helpers({
     createTChart: function () {
        // Gather data: 
            var tech =["ADL","MOM","MACD","OBV","STO"];            
            var techName = [],techInitial = [],techIncome =[],total_inc = [],final_inc = 0;

            
            for(var i = 1; i <= 5; i++) {
                total_inc = [];
                if(Session.get('T_income'+i) != 'none'){
                    total_inc = Session.get('T_total'+i);
                    if(total_inc.length>0)final_inc = Number(total_inc[total_inc.length-1]);
                    techIncome.push(final_inc);
                    techName.push(tech[i-1]);
                    techInitial.push(T_initialIncome);
                }
            }
      // Use Meteor.defer() to craete chart after DOM is ready:
      Meteor.defer(function() {
        // Create standard Highcharts chart with options:
        Highcharts.chart('Tchart', {
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
      });
    },
    simulate: function() {  
        var name = ["ADLsimTa","MOMsimTa","MACDsimTa","OBVsimTa","STOsimTa"]; 
        var tech =["Accumulation/ Distribution Line (ADL)","Momentum (MOM)" , "Moving Average Convergence Divergence (MACD)", "On-Balance Volume (OBV)" , "Stochastics (STO)"];           
        var data = [];
        var active = 1;
        var index = 0;
        
        
        for(var i = 1; i <= 5; i++) {
          var totalIncome = [];
          var Income = [];
          if(Session.get('T_income'+i) != 'none'){
            totalIncome = Session.get('T_total'+i);
            Income = Session.get('T_income'+i);

                for(var ti=0;ti < Income.length;ti++)
                Income[ti] = Income[ti].toFixed(2);
                for(var tn=0;tn < totalIncome.length;tn++)
                    totalIncome[tn] = totalIncome[tn].toFixed(2);
            
            if(active==1){
                data.push({ch:"checked",rnav:"Trnav "+name[i-1],slide:"Tslide_"+i,sindex:"Ts-index "+name[i-1]+"-label",box:"Tbox "+name[i-1],indicator:tech[i-1],num:trIDT[index],signal:trSignalT[index],price:trPriceT[index],income:Income,total:totalIncome});
                active = 0;
            }
            else data.push({ch:"",rnav:"Trnav "+name[i-1],slide:"Tslide_"+i,sindex:"Ts-index "+name[i-1]+"-label",box:"Tbox "+name[i-1],indicator:tech[i-1],num:trIDT[index],signal:trSignalT[index],price:trPriceT[index],income:Income,total:totalIncome});
            index ++;
          }
        }
        return data;
    }
  });
