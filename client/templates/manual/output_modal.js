  import Highcharts from 'highcharts';
  trIDT = [];
  trSignalT = [];
  trPriceT = [];

  Template.outputModalTemplate.helpers({
  	createChart: function () {
  		
      // Gather data: 
			var tech =["ADL","MOM","MACD","OBV","STO"];  
            var techName = [],techBuy = [],techSell = [];
			for(var i = 1; i <= 5; i++) {
	      		if(Session.get('T_tradePrice'+i) != 'none'){
	      			techName.push(tech[i-1]);
	      			techBuy.push(Session.get('T_buySignal'+i));
	      			techSell.push(Session.get('T_sellSignal'+i));
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
			    text: 'Stock Signals'
				}, 
			 xAxis: {
			            categories: techName
			        },
			 yAxis: {
			      min: 0,
			      title: {
			         text: 'Signal',
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
			            name: 'Buy',
			            data: techBuy
			        }, {
			            name: 'Sell',
			            data: techSell
			        }]
        });
      });
    },
  	trade: function() {
  		trIDT = [];
		trSignalT = [];
		trPriceT = [];
  		var name = ["ADLt","MOMt","MACDt","OBVt","STOt"]; 
  		var tech =["Accumulation/ Distribution Line (ADL)","Momentum (MOM)" , "Moving Average Convergence Divergence (MACD)", "On-Balance Volume (OBV)" , "Stochastics (STO)"];           
	    var data = [];
	    var first = 1;
	    var index = 0;
	    var choseI = [];
	    for(var i = 1; i <= 5; i++) {
	      if(Session.get('T_tradeDate'+i) != 'none'){

	      	trIDT.push(Session.get('T_tradeDate'+i));
	      	trSignalT.push(Session.get('T_tradeSignal'+i));
	      	trPriceT.push(Session.get('T_tradePrice'+i));

	      	if(first==1){
	      		data.push({ch:"checked",rnav:"rnav "+name[i-1],slide:"slide_t"+i,sindex:"s-index "+name[i-1]+"-label",box:"box "+name[i-1],num:trIDT[index],signal:trSignalT[index],price:trPriceT[index],indicator:tech[i-1]});
	      		first = 0;
	      	}
	      	else data.push({ch:"",rnav:"rnav "+name[i-1],slide:"slide_t"+i,sindex:"s-index "+name[i-1]+"-label",box:"box "+name[i-1],num:trIDT[index],signal:trSignalT[index],price:trPriceT[index],indicator:tech[i-1]});
	      	index ++;
	    	choseI.push(i);
	      }
	    }
	    Session.set('TchoseInd',choseI);
  			
	    return data;
  	}
  });
