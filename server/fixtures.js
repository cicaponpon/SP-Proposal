Meteor.methods({
    solveADL: function (CompanyName) {
     $companyN = eval('(' + CompanyName + ')');
     $data_count = $companyN.find().count();

     $prev_ADL = 0;

     $ADL = []; 
     $date = [];
     $price = [];
     for($N=0;$N < $data_count;$N++){
        $curr_data = $companyN.find({}, {sort: {_id: 1}, skip: $N, limit: 1 }).fetch();
        $date.push(String(_.uniq(_.pluck($curr_data,"trade_date"))));
        $curr_close = parseFloat(_.uniq(_.pluck($curr_data,"close_price")));//get closing price
        $price.push($curr_close);
        $curr_low = parseFloat(_.uniq(_.pluck($curr_data,"low_price")));//get low price
        $curr_high = parseFloat(_.uniq(_.pluck($curr_data,"high_price")));//get high price
        $curr_vol = parseFloat(_.uniq(_.pluck($curr_data,"total_volume")));//get volume
        $CLV = (($curr_close - $curr_low) - ($curr_high - $curr_close));//close location value
        if($CLV != 0 ) $CLV = $CLV / ($curr_high - $curr_low); 
        
        $MF_vol = $CLV * $curr_vol ;//money flow volume
        $curr_ADL = ($prev_ADL+ $MF_vol).toFixed(4); 
        $ADL.push(Number($curr_ADL));

        $prev_ADL = parseFloat($curr_ADL);
     }

     return [$ADL,$date,$price];
     
    },
    solveMomentum: function (CompanyName) { //from last day up to the first day
     $companyN = eval('(' + CompanyName + ')');
     $N = 0; //N-period ago
     $data_count = $companyN.find().count();
     
     $momentum = [];

     $date = [];
     $price = [];
     $i = 0;
     for($N=9;$N < $data_count;$N++){
        $curr_data = $companyN.find({}, {sort: {_id: -1}, skip: $i, limit: 1 }).fetch();
        $date.push(String(_.uniq(_.pluck($curr_data,"trade_date"))));
        $curr_close = parseFloat(_.uniq(_.pluck($curr_data,"close_price")));//current closing price
        $price.push($curr_close);

         $N_data = $companyN.find({}, {sort: {_id: -1}, skip: $N, limit: 1 }).fetch();
         $N_close =parseFloat(_.uniq(_.pluck($N_data,"close_price")));//update N closing price
         $momentum_v = ($curr_close - $N_close).toFixed(4);
         $momentum.push( Number($momentum_v));
         $i++;
     }
    
     return [$momentum,$date,$price];
     
    },
     solveMACD: function (CompanyName) { //from last day up to the first day
     $companyN = eval('(' + CompanyName + ')');
     $data_count = $companyN.find().count();
     $N1 = 12;
     $N2 = 26;

     $MACD_line = [];
     $Signal_line = [];
     $date = [];
     $price = [];

     for($i=0;$i < ($data_count-$N2+1);$i++){
        $curr_data = $companyN.find({}, {sort: {_id: -1}, skip: $i, limit: 1 }).fetch(); 
        $curr_close =  parseFloat(_.uniq(_.pluck($curr_data,"close_price")));
        $date.push(String(_.uniq(_.pluck($curr_data,"trade_date"))));
        $price.push($curr_close);

        $N = $N1;
        for($r=1;$r<=2;$r++){
             $prev_EMA = 0;
            //========================SOLVE FOR 12-day and 26-day EMA============================
            for($s=$i;$s < $i+$N;$s++){
                $N_data = $companyN.find({}, {sort: {_id: -1}, skip: $s, limit: 1 }).fetch(); 
                $N_close =  parseFloat(_.uniq(_.pluck($N_data,"close_price")));

                $prev_EMA += $N_close;
            }
                $prev_EMA /= $N;
                $multiplier = (2 / ( $N + 1) );

            if($r == 1){
              $EMA_N1  = ($curr_close - $prev_EMA) * $multiplier + $prev_EMA;  
              $N = $N2;
            } 
            else if($r == 2){
              $EMA_N2  = ($curr_close - $prev_EMA) * $multiplier + $prev_EMA;
            }
            //===================================================================================
        }
        //SOLVE FOR MACD
        $MACD_line.push($EMA_N1 - $EMA_N2);
     }
     
     $N = 9;   
     //==============SOLVE for 9-day EMA of MACD line================
     for($j=0;$j<($MACD_line.length-$N+1);$j++){
        $curr_price = $MACD_line[$j];
        $prev_EMA = 0;
        for($k=$j;$k < $j+$N;$k++){
                $prev_EMA += $MACD_line[$k];
        }
        $prev_EMA /= $N;
        $multiplier = (2 / ( $N + 1) );
        $EMA_N3  = ($curr_price - $prev_EMA) * $multiplier + $prev_EMA; 
        $Signal_line.push($EMA_N3);
     }
     return [$MACD_line, $Signal_line,$date,$price];
     
    },
    solveOnBalanceVol: function (CompanyName) {
     $companyN = eval('(' + CompanyName + ')');
     $data_count = $companyN.find().count();

     //$curr_obv = 0;
     $prev_obv = 0;
     $prev_close = parseFloat($companyN.findOne().close_price);

     $obv = [];
     $date = [];
     $price = [];
     for($N=1;$N < $data_count;$N++){
        $curr_data = $companyN.find({}, {sort: {_id: 1}, skip: $N, limit: 1 }).fetch(); 
        $date.push(String(_.uniq(_.pluck($curr_data,"trade_date"))));
        $curr_close =  parseFloat(_.uniq(_.pluck($curr_data,"close_price")));
        $price.push($curr_close);
        $curr_vol =  parseFloat(_.uniq(_.pluck($curr_data,"total_volume")));
        $curr_date = parseFloat(_.uniq(_.pluck($curr_data,"trade_date")));

        if($curr_close > $prev_close) $curr_obv = ($prev_obv + $curr_vol).toFixed(4);
        else if($curr_close < $prev_close) $curr_obv = ($prev_obv - $curr_vol).toFixed(4);
        else $curr_obv = ($prev_obv).toFixed(4);

        $obv.push(Number($curr_obv));
        $prev_obv = parseFloat($curr_obv);
        $prev_close = $curr_close;

     }
      return [$obv,$date,$price];
     
    },
     solveStochastics: function (CompanyName) {
     $companyN = eval('(' + CompanyName + ')');
     $N = 0; //N days ago
     $data_count = $companyN.find().count();
     
     $fastK= [];
     $slowK= [];
     $slowD= [];
     $tradeDate=[];
     $closePrice=[];
     $i = 0;
     for($N=14;$N < $data_count;$N++){
        $curr_data = $companyN.find({}, {sort: {_id: -1}, skip: $i, limit: 1 }).fetch();
        $curr_close = parseFloat(_.uniq(_.pluck($curr_data,"close_price")));//current closing price
        $closePrice.push($curr_close);
        $tradeDate.push(String(_.uniq(_.pluck($curr_data,"trade_date"))));
        $N_data = $companyN.find({}, {sort: {_id: -1},skip:$i, limit: 14}).fetch();
        $min_low =parseFloat(_.min(_.uniq(_.pluck($N_data,"low_price"))));//update N closing price
        $max_high =parseFloat(_.max(_.uniq(_.pluck($N_data,"high_price"))));//update N closing price
        $stochastics_fastK = (($curr_close - $min_low)/($max_high- $min_low));
        $fastK.push( Number($stochastics_fastK));
        $i++;
     }

     for($i=0; $i<$fastK.length-2;$i++){
        $sum=0;
        for($j=$i; $j<$i+3; $j++){
            $sum+= $fastK[$j];
        }
        $ave= $sum/3;
        $slowK.push(Number($ave));
     }

     for($i=0; $i<$slowK.length-2;$i++){
        $sum=0;
        for($j=$i; $j<$i+3; $j++){
            $sum+= $slowK[$j];
        }
        $ave= $sum/3;
        $slowD.push(Number($ave));
     }

     return [$slowK, $slowD, $tradeDate, $closePrice];
     
    },
    interpretADL_OBV: function(data){
        // $buy_signal = 0;
        // $sell_signal = 0;
        // $peak = [];

        // $array = data[0].slice();
        // $date = data[1].slice();
        // $price = data[2].slice();
        
        // $tradeDate =[];
        // $tradeSignal = [];
        // $tradePrice = [];

        // for($r=0;$r<2;$r++){
        //     for($i=0;$i < $array.length-1;){
        //         $count = 0;
        //         if($array[$i+1] > $array[$i]){
        //             while($array[$i+1] >= $array[$i]){
        //                 $i++;
        //                 if($r==1) $count++;
        //                 if($i==$array.length) break;
        //             }
        //             if($r==0) $peak.push($array[$i]);
        //             else{
        //                 if($count > 0){
        //                     $buy_signal++;
        //                     $tradeDate.push($date[$i]);
        //                     $tradeSignal.push("BUY");
        //                     $tradePrice.push($price[$i]);
        //                 } 
        //             }
        //         }
        //         else if($array[$i+1] < $array[$i]){
        //             while($array[$i+1] <= $array[$i]){
        //                 $i++;
        //                 if($r==1) $count++;
        //                 if($i==$array.length) break;
        //             }
        //             if($r==1){
        //                 if($count > 0){
        //                     $sell_signal++;
        //                     $tradeDate.push($date[$i]);
        //                     $tradeSignal.push("SELL");
        //                     $tradePrice.push($price[$i]);
        //                 } 
        //             }
        //         }
        //         else{
        //             $i++;
        //         }
        //     }
        //     if($r==0) $array = $peak.slice();
        // }

        // $table= [ $tradeDate,$tradeSignal,$tradePrice];

        // return [Number($buy_signal),Number($sell_signal), $table];
        $buy_signal = 0;
        $sell_signal = 0;

        $array = data[0].slice();
        $date = data[1].slice();
        $price = data[2].slice();
        
        $tradeDate =[];
        $tradeSignal = [];
        $tradePrice = [];

            for($i=0;$i < $array.length-5;$i=$i+5){
                if($array[$i+5] > $array[$i]){
                            $buy_signal++;
                            $tradeDate.push($date[$i]);
                            $tradeSignal.push("BUY");
                            $tradePrice.push($price[$i]);
                }
                else if($array[$i+5] < $array[$i]){
                            $sell_signal++;
                            $tradeDate.push($date[$i]);
                            $tradeSignal.push("SELL");
                             $tradePrice.push($price[$i]);
                    
                }
                else;
        }

        $table= [ $tradeDate,$tradeSignal,$tradePrice];

        return [Number($buy_signal),Number($sell_signal), $table];
    },
    interpretMomentum: function(data) {
        $buy_signal = 0;
        $sell_signal = 0;

        $Momentum = data[0].slice();
        $date = data[1].slice();
        $price = data[2].slice();
        
        $tradeDate =[];
        $tradeSignal = [];
        $tradePrice = [];

        for($i=$Momentum.length-1; $i > 0;){
            if($Momentum[$i] < 0){
                while($Momentum[$i] <= 0){
                   $i--;  
                   if($i==0){
                    if($Momentum[$i] > 0){
                            $buy_signal++;
                            $tradeDate.push($date[$i]);
                            $tradeSignal.push("BUY");
                            $tradePrice.push($price[$i]);
                    } 
                    break;
                   }
                } 
                if($i>0){
                            $buy_signal++;
                            $tradeDate.push($date[$i]);
                            $tradeSignal.push("BUY");
                            $tradePrice.push($price[$i]);
                    } 
            }
            else if($Momentum[$i] > 0){
                while($Momentum[$i] >= 0){
                   $i--;
                   if($i==0){
                    if($Momentum[$i] < 0){
                            $sell_signal++;
                            $tradeDate.push($date[$i]);
                            $tradeSignal.push("SELL");
                            $tradePrice.push($price[$i]);
                        } 
                    break;
                   }
                } 
                if($i>0){
                            $sell_signal++;
                            $tradeDate.push($date[$i]);
                            $tradeSignal.push("SELL");
                            $tradePrice.push($price[$i]);
                } 
            }
            else{
                $i--;
            }
        }

        $table= [ $tradeDate,$tradeSignal,$tradePrice];

        return [Number($buy_signal),Number($sell_signal), $table]; 
    },
    interpretMACD: function(data){
        $buy_signal = 0;
        $sell_signal = 0;
        $buy_percent = $sell_percent = 0;
        $MACD_line =  data[0].slice();
        $Signal_line = data[1].slice();
        $date = data[2].slice();
        $price = data[3].slice();
        
        $tradeDate =[];
        $tradeSignal = [];
        $tradePrice = [];

         for($i=$Signal_line.length-1; $i > 0;){    
            if($MACD_line[$i] < $Signal_line[$i]){
                while($MACD_line[$i] <= $Signal_line[$i]){
                   $i--;  
                   if($i==0){
                    if($MACD_line[$i] > $Signal_line[$i]){
                            $buy_signal++;
                            $tradeDate.push($date[$i]);
                            $tradeSignal.push("BUY");
                            $tradePrice.push($price[$i]);
                    }
                    break;
                   }
                } 
                if($i>0){
                            $buy_signal++;
                            $tradeDate.push($date[$i]);
                            $tradeSignal.push("BUY");
                            $tradePrice.push($price[$i]);
                }
            }
            else if($MACD_line[$i] > $Signal_line[$i]){
                while($MACD_line[$i] >= $Signal_line[$i]){
                   $i--;
                   if($i==0){
                    if($MACD_line[$i] < $Signal_line[$i]){
                            $sell_signal++;
                            $tradeDate.push($date[$i]);
                            $tradeSignal.push("SELL");
                            $tradePrice.push($price[$i]);
                    } 
                    break;
                   }
                } 
                if($i>0){
                            $sell_signal++;
                            $tradeDate.push($date[$i]);
                            $tradeSignal.push("SELL");
                            $tradePrice.push($price[$i]);
                } 
            }
            else{
                $i--;
            }
        }

        $table= [ $tradeDate,$tradeSignal,$tradePrice];

        return [Number($buy_signal),Number($sell_signal), $table];
    },
    interpretStochastics: function (m) {
        $K= m[0];
        $D= m[1];
        $date = m[2];
        $price = m[3];
        $buy_signal=0;
        $sell_signal=0;

        $tradeDate =[];
        $tradeSignal = [];
        $tradePrice = [];

        $i= $D.length;
        while($i!=0 && $i>-1){
            while($K[$i]<0.20 && $D[$i]<0.20  && $i>-1){
                if($K[$i]<$D[$i]){
                    if(($K[$i-1]>$D[$i-1])){
                        $buy_signal++;
                        $tradeDate.push($date[$i]);
                        $tradeSignal.push("BUY");
                        $tradePrice.push($price[$i]);
                        while($K[$i]<0.20 && $D[$i]<0.20 && $i>-1){
                            $i--;
                        }
                        break;
                    }
                }
                $i--;
            }

            while($K[$i]>0.80 && $D[$i]>0.80 &&  $i>-1){
                if($K[$i]>=$D[$i]){
                    if(($K[$i-1]< $D[$i-1])){
                        $sell_signal++;
                        $tradeDate.push($date[$i]);
                        $tradeSignal.push("SELL");
                        $tradePrice.push($price[$i]);
                        while($K[$i]>0.80 && $D[$i]>0.80 && $i>-1){
                            $i--;
                        }
                        break;
                    }
                }
                $i--;
            }
            $i--;
        }

        $table= [ $tradeDate,$tradeSignal,$tradePrice];

        return [Number($buy_signal),Number($sell_signal), $table];
    },
    getTotal: function(pass){
      initial= pass[0];
      incomeArray= pass[1];
      var curr= initial;
      var total= [];

      for(var j= 0; j<incomeArray.length; j++){
        curr= curr+incomeArray[j];
        total.push(curr);
      }

      return[pass[2], total];
    },
    getPrice: function(pass){
        colSignal= pass[0];
        colPrice= pass[1];
        var shares= pass[3];
        var buy_start=0;
        var price=[];
        for(var j= 0; j< colSignal.length; j++){
            if(colSignal[j] == 'BUY'){
                
                if(buy_start==0){
                    buy_start= 1;
                    price.push(shares * colPrice[j] * -1); 
                }else if (j==colSignal.length-1){
                    price.push(0);
                }else{
                    if (colSignal[j-1] == 'BUY'){
                        price.push(0);
                    }else{
                        price.push(shares * colPrice[j]* -1); 
                    }
                }
            }else{
                
                if(buy_start==0){
                    price.push(0);
                }else{
                    if (colSignal[j-1] == 'SELL'){
                        price.push(0);
                    }else{
                        price.push(shares * colPrice[j]); 
                    }
                }
            }
        }

        return [pass[2],price,pass[4]];
        
    },
    solveTableStochastics: function (data) {
     $N = 0; //N days ago
     $tempDate= data[0].reverse();
     $tempLow= data[1].reverse(); 
     $tempHigh= data[2].reverse();
     $tempClose= data[3].reverse();
     $tempVol= data[4].reverse();
     $data_count = $tempDate.length;
     $fastK= [];
     $slowK= [];
     $slowD= [];
     $tradeDate=[];
     $closePrice=[];
     $i = 0;
     for($N=14;$N <= $data_count;$N++){
        
        $curr_close = parseFloat($tempClose[$i]);//current closing price
        $closePrice.push($curr_close);
        $tradeDate.push(String($tempDate[$i]));
        $pastLow= $tempLow.slice($i, $i+14);
        $pastHigh= $tempHigh.slice($i, $i+14);
        
        $min_low =parseFloat(Math.min.apply( Math, $pastLow ));//update N closing price
        $max_high =parseFloat(Math.max.apply( Math, $pastHigh ));//update N closing price
        $stochastics_fastK = (($curr_close - $min_low)/($max_high- $min_low));
        $fastK.push( Number($stochastics_fastK));
        $i++;
     }

     for($i=0; $i<$fastK.length-2;$i++){
        $sum=0;
        for($j=$i; $j<$i+3; $j++){
            $sum+= $fastK[$j];
        }
        $ave= $sum/3;
        $slowK.push(Number($ave));
     }

     for($i=0; $i<$slowK.length-2;$i++){
        $sum=0;
        for($j=$i; $j<$i+3; $j++){
            $sum+= $slowK[$j];
        }
        $ave= $sum/3;
        $slowD.push(Number($ave));
     }

     return [$slowK, $slowD, $tradeDate, $closePrice];
     
    },
    solveTableOnBalanceVol: function (data) {
     $tempDate= data[0];
     $tempLow= data[1]; 
     $tempHigh= data[2];
     $tempClose= data[3];
     $tempVol= data[4];
     $data_count = $tempDate.length;
     //$curr_obv = 0;
     $prev_obv = 0;
     $prev_close = parseFloat($tempClose[0]);


     $obv = [];
     $date = [];
     $price = [];
     for($N=1;$N < $data_count;$N++){
        $date.push(String($tempDate[$N]));
        $curr_close =  parseFloat($tempClose[$N]);
        $price.push($curr_close);
        $curr_vol =  parseFloat($tempVol[$N]);
        $curr_date = parseFloat($tempDate[$N]);

        if($curr_close > $prev_close) $curr_obv = ($prev_obv + $curr_vol).toFixed(4);
        else if($curr_close < $prev_close) $curr_obv = ($prev_obv - $curr_vol).toFixed(4);
        else $curr_obv = ($prev_obv).toFixed(4);

        $obv.push(Number($curr_obv));
        $prev_obv = parseFloat($curr_obv);
        $prev_close = $curr_close;

     }
      return [$obv,$date,$price];
     
    },
     solveTableMACD: function (data) { //from last day up to the first day
    $tempDate= data[0].reverse();
     $tempLow= data[1].reverse(); 
     $tempHigh= data[2].reverse();
     $tempClose= data[3].reverse();
     $tempVol= data[4].reverse();
     $data_count = $tempDate.length;
     $N1 = 12;
     $N2 = 26;

     $MACD_line = [];
     $Signal_line = [];
     $date = [];
     $price = [];

     for($i=0;$i < ($data_count-$N2+1);$i++){
        $curr_close= parseFloat($tempClose[$i]);
        $date.push(String($tempDate[$i]));
        $price.push($curr_close);

        $N = $N1;
        for($r=1;$r<=2;$r++){
             $prev_EMA = 0;
            //========================SOLVE FOR 12-day and 26-day EMA============================
            for($s=$i;$s < $i+$N;$s++){
                $N_close= parseFloat($tempClose[$s]);
                $prev_EMA += $N_close;
            }
                $prev_EMA /= $N;
                $multiplier = (2 / ( $N + 1) );

            if($r == 1){
              $EMA_N1  = ($curr_close - $prev_EMA) * $multiplier + $prev_EMA;  
              $N = $N2;
            } 
            else if($r == 2){
              $EMA_N2  = ($curr_close - $prev_EMA) * $multiplier + $prev_EMA;
            }
            //===================================================================================
        }
        //SOLVE FOR MACD
        $MACD_line.push($EMA_N1 - $EMA_N2);
     }
     
     $N = 9;   
     //==============SOLVE for 9-day EMA of MACD line================
     for($j=0;$j<($MACD_line.length-$N+1);$j++){
        $curr_price = $MACD_line[$j];
        $prev_EMA = 0;
        for($k=$j;$k < $j+$N;$k++){
                $prev_EMA += $MACD_line[$k];
        }
        $prev_EMA /= $N;
        $multiplier = (2 / ( $N + 1) );
        $EMA_N3  = ($curr_price - $prev_EMA) * $multiplier + $prev_EMA; 
        $Signal_line.push($EMA_N3);
     }
     return [$MACD_line, $Signal_line,$date,$price];
     
    },
    solveTableMomentum: function (data) { //from last day up to the first day
     $tempDate= data[0].reverse();
     $tempLow= data[1].reverse(); 
     $tempHigh= data[2].reverse();
     $tempClose= data[3].reverse();
     $tempVol= data[4].reverse();
     $data_count = $tempDate.length;
     $N = 0; //N-period ago
     
     $momentum = [];

     $date = [];
     $price = [];
     $i = 0;
     for($N=9;$N < $data_count;$N++){
        $date.push($tempDate[$i]);
        $curr_close= parseFloat($tempClose[$i]);
        $price.push($curr_close);

         $N_close= parseFloat($tempClose[$N]);
         $momentum_v = ($curr_close - $N_close).toFixed(4);
         $momentum.push( Number($momentum_v));
         $i++;
     }
    
     return [$momentum,$date,$price];
     
    },solveTableADL: function (data) {
     $tempDate= data[0];
     $tempLow= data[1]; 
     $tempHigh= data[2];
     $tempClose= data[3];
     $tempVol= data[4];
     $data_count = $tempDate.length;
     $prev_ADL = 0;

     $ADL = []; 
     $date = [];
     $price = [];
     for($N=0;$N < $data_count;$N++){
        $date.push($tempDate[$N]);
        $curr_close=parseFloat($tempClose[$N]);
        $price.push($curr_close);
        $curr_low= parseFloat($tempLow[$N]);
        $curr_high= parseFloat($tempHigh[$N]);
        $curr_vol= parseFloat($tempVol[$N]);
        $CLV = (($curr_close - $curr_low) - ($curr_high - $curr_close));//close location value
        if($CLV != 0 ) $CLV = $CLV / ($curr_high - $curr_low); 
        
        $MF_vol = $CLV * $curr_vol ;//money flow volume
        $curr_ADL = ($prev_ADL+ $MF_vol).toFixed(4); 
        $ADL.push(Number($curr_ADL));

        $prev_ADL = parseFloat($curr_ADL);
     }

     return [$ADL,$date,$price];
     
    }
    
});
