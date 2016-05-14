var indicator = [];
  var tableIndicator = [];
Template.inputForm.helpers({
    indicators: function(){
        return ["Accumulation/ Distribution Line","Momentum" , "Moving Average Convergence Divergence (MACD)", "On-Balance Volume" , "Stochastics"]
      }
  });
Template.inputForm.events({
    'click #createTable': function(event){
        var num_rows = document.getElementById('rows').value;
        Session.set('rowNum', num_rows);
        var theader = '<table class="table table-bordered table-condensed" id="InputTable">\n';
        var tbody = ' <tr><th>TRADE NO.</th><th>LOW PRICE</th><th>HIGH PRICE</th><th>CLOSE PRICE</th><th>TOTAL VOLUME</th></tr>';

        for( var i=0; i<num_rows;i++)
        {
          tbody += '<tr>';
          tbody += '<td class= "in">';
          tbody += i+1;
          tbody += '</td>';
          for( var j=1; j<5;j++)
          {
            tbody += '<td class= "in">';
            tbody += '<input type="number"';
            tbody += 'id="in'+i+'_' +j +'"' ;
            tbody += 'class="tableInput"/>';
            tbody += '</td>';
          }
          tbody += '</tr>\n';
        }
        var tfooter = '</table>\n';
        document.getElementById('wrapper').innerHTML = theader + tbody + tfooter;

        document.getElementById("analyzerTable").reset();
        $('#tableModal').modal({backdrop: 'static', keyboard: false});
    },
    'click #tableIndicator-check': function (event) {
        var tech_ind = $(event.currentTarget).val();
        if(indexOf(tech_ind) == -1)
            tableIndicator.push(tech_ind);
        else
            delete tableIndicator[indexOf(tech_ind)];
    },

    'click #indicator-check': function (event) {
        var tech_ind = $(event.currentTarget).val();
        if(indexOf(tech_ind) == -1)
            indicator.push(tech_ind);
        else
            delete indicator[indexOf(tech_ind)];
    }
  });

Template.tableModalTemplate.events({
 'click #submitTable': function(event){
        event.preventDefault();
        var row= Session.get('rowNum');
        var tnum=[];
        var low=[];
        var high=[];
        var close=[];
        var volume = [];
        var allData= [];

        for(var i=0; i<row; i++){
          tnum.push(Number(i+1));
          low.push(document.getElementById('in'+i+'_1').value);
          high.push(document.getElementById('in'+i+'_2').value);
          close.push(document.getElementById('in'+i+'_3').value);
          volume.push(document.getElementById('in'+i+'_4').value);
        }

        allData= [tnum, low, high, close, volume];
        console.log(allData[0].length);
        tab = tableIndicator.filter(function() { return true; });

        for(var j=1;j<=5;j++){
            Session.set('T_buySignal','none');
            Session.set('T_sellSignal','none');
            Session.set('T_tradeDate'+j,'none');
            Session.set('T_tradeSignal'+j,'none');
            Session.set('T_tradePrice'+j,'none');
        }

         for(var i=0;i<tableIndicator.length;i++){
            if(tableIndicator[i] == "Accumulation/ Distribution Line"){
                Meteor.call('solveTableADL',allData,function (error, m) {
                 
                  Meteor.call('interpretADL_OBV',m,function (error, n) {
                        Session.set('T_buySignal1',n[0]);
                        Session.set('T_sellSignal1',n[1]);
                        Session.set('T_tradeDate1', n[2][0]);
                        Session.set('T_tradeSignal1', n[2][1]);
                        Session.set('T_tradePrice1', n[2][2]);
                        console.log(n);
                    });
                });
                
            }
            else if(tableIndicator[i] == "Momentum"){
                Meteor.call('solveTableMomentum',allData,function (error, m) {
                 
                    Meteor.call('interpretMomentum',m,function (error, n) {
                        Session.set('T_buySignal2',n[0]);
                        Session.set('T_sellSignal2',n[1]);
                        Session.set('T_tradeDate2', n[2][0]);
                        Session.set('T_tradeSignal2', n[2][1]);
                        Session.set('T_tradePrice2', n[2][2]);
                        console.log(n);
                    });
                });
            }
            else if(tableIndicator[i] == "Moving Average Convergence Divergence (MACD)"){
                Meteor.call('solveTableMACD',allData,function (error, m) {
                 
                  Meteor.call('interpretMACD',m,function (error, n) {
                        Session.set('T_buySignal3',n[0]);
                        Session.set('T_sellSignal3',n[1]);
                        Session.set('T_tradeDate3', n[2][0]);
                        Session.set('T_tradeSignal3', n[2][1]);
                        Session.set('T_tradePrice3', n[2][2]);
                        console.log(n);
                    });
                });
            }
            else if(tableIndicator[i] == "On-Balance Volume"){
                Meteor.call('solveTableOnBalanceVol',allData,function (error, m) {
                 
                  Meteor.call('interpretADL_OBV',m,function (error, n) {
                        Session.set('T_buySignal4',n[0]);
                        Session.set('T_sellSignal4',n[1]);
                        Session.set('T_tradeDate4', n[2][0]);
                        Session.set('T_tradeSignal4', n[2][1]);
                        Session.set('T_tradePrice4', n[2][2]);
                        console.log(n);
                    });
                });
            }
            else if(tableIndicator[i] == "Stochastics"){
                Meteor.call('solveTableStochastics',allData,function (error, m) {
                 //console.log(m);
                 Meteor.call('interpretStochastics',m,function (error, n) {
                        Session.set('T_buySignal5',n[0]);
                        Session.set('T_sellSignal5',n[1]);
                        Session.set('T_tradeDate5', n[2][0]);
                        Session.set('T_tradeSignal5', n[2][1]);
                        Session.set('T_tradePrice5', n[2][2]);
                        console.log(n);
                    });
                });
            }
        }
        tableIndicator = [];
        
        $('#tableModal').modal('hide');
        $('#outputModal').modal({backdrop: 'static', keyboard: false});
        
    }
});
  
function indexOf(k) {
  for(var i=0; i < indicator.length; i++){
    if( indicator[i] === k || ( indicator[i] !== indicator[i] && k !== k ) ){
      return i;
    }
  }
  return -1;
}

