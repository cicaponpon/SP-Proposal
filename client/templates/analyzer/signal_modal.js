  import Highcharts from 'highcharts';
  trDate = [];
  trSignal = [];
  trPrice = [];

  Template.signalModalTemplate.helpers({
  	createChart: function () {
      // Gather data: 
			var tech =["ADL","MOM","MACD","OBV","STO"];            
			var techName = [],techBuy = [],techSell = [];
			for(var i = 1; i <= 5; i++) {
	      		if(Session.get('tradePrice'+i) != 'none'){
	      			techName.push(tech[i-1]);
	      			techBuy.push(Session.get('buySignal'+i));
	      			techSell.push(Session.get('sellSignal'+i));
	      		}
	      	}
      		
      // Use Meteor.defer() to craete chart after DOM is ready:
      Meteor.defer(function() {
        // Create standard Highcharts chart with options:
        Highcharts.chart('chart', {
        	chart: {
        		type: 'bar'
        	},
        	title: {
			    text: 'Buy and Sell Stock Signals',
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
  		trDate = [];
		trSignal = [];
		trPrice = [];
  		var name = ["ADL","MOM","MACD","OBV","STO"]; 
  		var tech =["Accumulation/ Distribution Line (ADL)","Momentum (MOM)" , "Moving Average Convergence Divergence (MACD)", "On-Balance Volume (OBV)" , "Stochastics (STO)"];           
	    var data = [];
	    var first = 1;
	    var index = 0;
	    var choseI = [];
	    for(var i = 1; i <= 5; i++) {
	      if(Session.get('tradeDate'+i) != 'none'){

	      	trDate.push(Session.get('tradeDate'+i));
	      	trSignal.push(Session.get('tradeSignal'+i));
	      	trPrice.push(Session.get('tradePrice'+i));

	      	if(first==1){
	      		data.push({ch:"checked",rnav:"rnav "+name[i-1],slide:"slide_"+i,sindex:"s-index "+name[i-1]+"-label",box:"box "+name[i-1],date:trDate[index],signal:trSignal[index],price:trPrice[index],indicator:tech[i-1]});
	      		first = 0;
	      	}
	      	else data.push({ch:"",rnav:"rnav "+name[i-1],slide:"slide_"+i,sindex:"s-index "+name[i-1]+"-label",box:"box "+name[i-1],date:trDate[index],signal:trSignal[index],price:trPrice[index],indicator:tech[i-1]});
	    	index ++;
	    	choseI.push(i);
	      }
	    }
	    Session.set('choseInd',choseI);
  			
	    return data;
  	}
  });
  // Template.signalModalTemplate.helpers({
  //   createChart: function () {
  //     // Gather data: 
  //     		var buySignal = Session.get('buySignal2'),
  //           sellSignal = Session.get('sellSignal2'),
  //           signalsData = [{
  //               y: buySignal,
  //               name: "Buy"
  //            }, {
  //                y: sellSignal,
  //                name: "Sell"
  //            }];
  //     // Use Meteor.defer() to craete chart after DOM is ready:
  //     Meteor.defer(function() {
  //       // Create standard Highcharts chart with options:
  //       Highcharts.chart('chart', {
  //       	title: {
		// 	    text: 'Signals'
		// 		}, 
		//     plotOptions: {
		//       pie: {
		//          innerSize: 80,
		//          depth: 50
		//       }
		//    	},
  //         	series: [{
  //         	type: 'pie',  
  //           data: signalsData
  //         }]
  //       });
  //     });
  //   }
  // });
