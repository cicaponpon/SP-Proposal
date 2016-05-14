  var indicator = [];
  Template.analyzerForm.helpers({
     indicators: function(){
        return ["Accumulation/ Distribution Line","Momentum" , "Moving Average Convergence Divergence (MACD)", "On-Balance Volume" , "Stochastics"]
      },
     companyNames: function(){
         var companyCol = Companies.find({}, {sort: {company:1}}).fetch();
         var company = _.pluck(companyCol,"company");
         return _.uniq(company);
     },
  });
  
  Template.analyzerForm.events({
    'click #indicator-check': function (event) {
        var tech_ind = $(event.currentTarget).val();
        if(indexOf(tech_ind) == -1)
            indicator.push(tech_ind);
        else
            delete indicator[indexOf(tech_ind)];
    }, 
    'click #submit': function(event){
        event.preventDefault();
        var CompanyName = document.getElementById("company-select").value;
        indicator = indicator.filter(function() { return true; });
        for(var j=1;j<=5;j++){
            Session.set('buySignal','none');
            Session.set('sellSignal','none');
            Session.set('tradeDate'+j,'none');
            Session.set('tradeSignal'+j,'none');
            Session.set('tradePrice'+j,'none');
        }       

        for(var i=0;i<indicator.length;i++){
            if(indicator[i] == "Accumulation/ Distribution Line"){
                Meteor.call('solveADL',CompanyName,function (error, m) {
                
                  Meteor.call('interpretADL_OBV',m,function (error, n) {
                        Session.set('buySignal1',n[0]);
                        Session.set('sellSignal1',n[1]);
                        Session.set('tradeDate1', n[2][0]);
                        Session.set('tradeSignal1', n[2][1]);
                        Session.set('tradePrice1', n[2][2]);
                    });
                });
                
            }
            else if(indicator[i] == "Momentum"){
                Meteor.call('solveMomentum',CompanyName,function (error, m) {
                 
                    Meteor.call('interpretMomentum',m,function (error, n) {
                        Session.set('buySignal2',n[0]);
                        Session.set('sellSignal2',n[1]);
                        Session.set('tradeDate2', n[2][0]);
                        Session.set('tradeSignal2', n[2][1]);
                        Session.set('tradePrice2', n[2][2]);
                    });
                });
            }
            else if(indicator[i] == "Moving Average Convergence Divergence (MACD)"){
                Meteor.call('solveMACD',CompanyName,function (error, m) {
                 
                  Meteor.call('interpretMACD',m,function (error, n) {
                        Session.set('buySignal3',n[0]);
                        Session.set('sellSignal3',n[1]);
                        Session.set('tradeDate3', n[2][0]);
                        Session.set('tradeSignal3', n[2][1]);
                        Session.set('tradePrice3', n[2][2]);
                    });
                });
            }
            else if(indicator[i] == "On-Balance Volume"){
                Meteor.call('solveOnBalanceVol',CompanyName,function (error, m) {
                 
                  Meteor.call('interpretADL_OBV',m,function (error, n) {
                        Session.set('buySignal4',n[0]);
                        Session.set('sellSignal4',n[1]);
                        Session.set('tradeDate4', n[2][0]);
                        Session.set('tradeSignal4', n[2][1]);
                        Session.set('tradePrice4', n[2][2]);
                    });
                });
            }
            else if(indicator[i] == "Stochastics"){
                Meteor.call('solveStochastics',CompanyName,function (error, m) {
                 
                 Meteor.call('interpretStochastics',m,function (error, n) {
                        Session.set('buySignal5',n[0]);
                        Session.set('sellSignal5',n[1]);
                        Session.set('tradeDate5', n[2][0]);
                        Session.set('tradeSignal5', n[2][1]);
                        Session.set('tradePrice5', n[2][2]);
                    });
                });
            }
        }
        indicator = [];
        document.getElementById("analyzerF").reset();
        $('#signalModal').modal({backdrop: 'static', keyboard: false});

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


