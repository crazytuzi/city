var myDate = new Date();
//console.log("开始时间",myDate.toLocaleTimeString());
function p(name){
	return function(d){ return d[name]; }
}
/*
转换为弧度
*/
function toPositiveRadian(r){ return r > 0 ? r : r + Math.PI*2; }
/*
转换为角度
*/
function toDegree(r){ return r*180/Math.PI; }


var width = 960,
	height = 600,
	centered;
	zoomRender = false;

var proj = d3.geo.azimuthalEqualArea()
    .scale(width)
    .translate([33.5, 262.5])
    .rotate([100, -45])
    .center([-17.6076, -4.7913]) // rotated [-122.4183, 37.7750]
    .scale(1297);


var path = d3.geo.path().projection(proj);


var svg = d3.select("#map").append("svg")
		.attr("width", width)
		.attr("height", height);

var g = svg.append("g");
/*
d3.csv("csv/netbars.csv",function(error,net_bars){
	console.log(net_bars);
})
*/


var parseDate = d3.time.format("%x").parse;

queue()
	.defer(d3.csv, "csv/netbarsinfo.csv")
	.defer(d3.csv, "csv/data_swsj_time.csv")
	//.defer(d3.json, "us.json")
	.await(intialLoad);
function intialLoad(error, netbarsinfo,swjl){
	console.log(netbarsinfo);
	/*
	直接加载600多w条数据会挂
	用d3.csv也不行
	*/
	var myDate = new Date();
	console.log("开始加载数据",myDate.toLocaleTimeString());
	swjl.forEach(function(t, i){
		['SITE', 'SEX', 'AREA', 'BIRTHYEAR','PERSONID','HOURS','ON_HOUR','OFF_HOUR',
		].forEach(function(field){
			t[field] = +t[field];});
		t['ON_DAY']=parseDate(t['ON_DAY']);
		t['index'] = i;
	});
	/*
	netbarsinfo.forEach(function(t, i){
		['SITEID','NAME','lng','lat',
		].forEach(function(field){
			t[field] = +t[field];});
	});
	console.log(netbarsinfo);
	*/
	
	//console.log(swjl);
	var tmp_bars={};
	for (var i=0;i<netbarsinfo.length;++i) {
		tmp_bars[netbarsinfo[i].SITEID]={}
		tmp_bars[netbarsinfo[i].SITEID].list=[0,0];
		tmp_bars[netbarsinfo[i].SITEID].lat=netbarsinfo[i].lat;
		tmp_bars[netbarsinfo[i].SITEID].lng=netbarsinfo[i].lng;
		tmp_bars[netbarsinfo[i].SITEID].flag=0;
	}
	/*
	bars.forEach(function(t, i){
		['SITEID', 'TITLE', 'lng', 'lat',
		].forEach(function(field){
			t[field] = +t[field];});
		
	});
	*/

	/*
	1284008
	这里为在128w条数据增加到600多w条数据
	测试crossfiflter会挂
	*/
	/*
	var v_index=1284008
	var length=swjl.length;
	for (var i = 0; i < length; i++) {
		var v_day_pre=swjl[i].SWSJ_DAY;
		var v_hour_pre=swjl[i].HOURS;
		var v_SWSC=swjl[i].SWSC;
		for (var j = 1; j <=v_SWSC; j++) {
			var dic=new Array();
			dic.PERSONID=swjl[i].PERSONID;
			dic.SITE=swjl[i].SITE;
			dic.SEX=swjl[i].SEX;
			dic.AREA=swjl[i].AREA;
			dic.BIRTHYEAR=swjl[i].BIRTHYEAR;
			dic.SWJLID=swjl[i].SWJLID;
			dic.index=v_index;
			//这里置上网时长为-1
			dic.SWSC=-1;
			v_hour_pre=v_hour_pre+1;
			if (v_hour_pre == 24) {
				v_hour_pre =0;
				v_day_pre=v_day_pre+1;
				if (v_day_pre == 1032) {
					v_day_pre = 1101;
				}else{
					if (v_day_pre == 1131) {
						v_day_pre = 1201;
					}
				}
			}
			dic.HOURS=v_hour_pre;
			dic.SWSJ_DAY=v_day_pre;
			swjl.push(dic);
			v_index=v_index+1;
		}
	}
	*/

	var myDate = new Date();
	//console.log("加载数据结束",myDate.toLocaleTimeString());


	/*
	数据清洗已经利用python事先完成
	这里不需要
	*/
	/*
	swjl = swjl.filter(function(d){ return d; });
	var myDate = new Date();
	console.log("数据清洗",myDate.toLocaleTimeString());
	*/


	/*
	crossfilter				构造多维数据集
	crossfilter.groupAll()	一个便捷的功能对所有的记录进行分组和减少为单一值
	*/
	swjlCF=crossfilter(swjl);
	all = swjlCF.groupAll();


	/*
	所有数据
	*/
	swjlIndex = swjlCF.dimension(function(d){ return d.index; });
	swjlIndexs = swjlIndex.group();
	console.log("所有数据的数量:",swjlIndexs.size());

	
	/*
	网吧
	*/
	netbar = swjlCF.dimension(function(d){ return d.SITE; });
	netbars = netbar.group();
	console.log("网吧的数量:",netbars.size());

	/*
	年份
	*/
	year=swjlCF.dimension(function(d){ return d.BIRTHYEAR;});
	years=year.group();
	console.log("年份的数量:",years.size());

	/*
	小时
	*/
	var hour=swjlCF.dimension(function(d){ return d.HOURS; });
	hours=hour.group();
	console.log("小时的数量:",hours.size());

	/*
	上网时长
	这里可进行筛选,或者新开一个dimension去除极值的情况
	*/
	var swsc=swjlCF.dimension(function(d){ return d.HOURS; });
	swscs=swsc.group();
	//console.log(swscs);
 	console.log("上网时长的数量:",swscs.size());


	/*
	籍贯
	*/
	area=swjlCF.dimension(function(d){ return d.AREA});
	areas=area.group();
	console.log('籍贯的数量:',areas.size());


	/*
	性别
	*/
	sex=swjlCF.dimension(function(d){ return d.SEX});
	sexs=sex.group();
	console.log('性别',sexs.size());

	/*
	次数
	*/
	/*
	frequency=swjlCF.dimension(function(d){ return d.PERSONID});
	frequencies=frequency.group();
	console.log('次数',frequencies.size());
	*/


	/*
	选择上网时段
	*/
	var onday = swjlCF.dimension(function(d){ return d.ON_DAY; });
	ondays=onday.group();
	console.log('日期的数量:',ondays.size());


	var onhour = swjlCF.dimension(function(d){ return d.ON_HOUR; });
	onhours=onhour.group();

	var offhour = swjlCF.dimension(function(d){ return d.OFF_HOUR; });
	offhours=offhour.group();




	var Wlb = 1.5;
	tWidth = swjlCF.dimension(function(d){ return d.HOURS; });
	widthLogs = tWidth.group(function(d, i){ 
	 return Math.pow(Wlb, Math.floor(Math.log(d + 1)/Math.log(Wlb))); });

	var Llb = 1.3;
	length = swjlCF.dimension(function(d){ return d.HOURS; });
	//lengths = length.group(function(d, i){ return d3.round(d, -1); });
	lengthLogs = length.group(function(d, i){ 
	 return Math.pow(Llb, Math.floor(Math.log(d + 1)/Math.log(Llb))); });
	
	var Ilb = 2;
	injury = swjlCF.dimension(function(d){ return d.BIRTHYEAR; });


	//定义时间比例尺

	//var timeScale = d3.time.scale().domain([new Date(2016, 10, 01), new Date(2016, 12, 31)]) .range([0, 87]);

	//timeScale = d3.time.scale().domain([new Date(2016, 10, 1), new Date(2016, 12, 31)]) .range([0,91]); 

	var bCharts = [
		/*
	    barChart()
		 	.dimension(hour)
		 	.group(hours)
		 	.tickFormat(function(d){
		 		console.log(d);
		 		if(d<=20){return d3.format('.0f')(d-1); }
		 	})
		 	.x(d3.scale.linear()
		 		.domain([0, 240])
		 		.rangeRound([0, 1000]))
		 	.barWidth(2),*/
		/*	
		barChart()
			.dimension(length)
			.group(lengthLogs)
			.tickFormat(function(d){ return d3.format('.0f')(d-1); })			
			.x(d3.scale.log().base([Llb])
				.domain([1, d3.max(lengthLogs.all().map(function(d, i){ return d.key; }))])
				.rangeRound([0, 190]))
			.barWidth(2),*/

			//上网日期
		
		barChart()
			.dimension(onday)
			.group(ondays)
			.tickFormat(function(d){return d3.time.format("%e %b")(d);})
			.x(d3.time.scale()
				.domain([d3.min(ondays.all().map(function(d,i){return d.key;})),d3.max(ondays.all().map(function(d,i){return d.key;}))])
				.range([0,200]))
			.barWidth(1),
		//上网时长
		barChart()
			.dimension(length)
			.group(lengthLogs)
			.tickFormat(function(d,i){if(d<200){return d3.format('.0f')(d-1);} })
			.x(d3.scale.log().base([Llb])
				.domain([1, d3.max(lengthLogs.all().map(function(d,i){return d.key;}))])
				.rangeRound([0, 180]))
			.barWidth(2),


		

		//上网次数
		/*
		barChart()
			.dimension(frequency)
			.group(frequencies)
			.tickFormat(d3.format(''))
			.x(d3.scale.linear()
				.domain([1900, 2003])
				.rangeRound([0,210]))
			.barWidth(1),
			
			.dimension(year)
			.group(years)
			.tickFormat(function(d){ return d3.format('.0f')(d-1); })			
			.x(d3.scale.log().base([Ilb])
				.domain([1, 500+  d3.max(years.all().map(function(d, i){ return d.key; }))])
				.rangeRound([0, 200]))
			.barWidth(10),	
			*/

		//出生年
		barChart()
			.dimension(year)
			.group(years)
			.tickFormat(d3.format(''))
			.x(d3.scale.linear()
				.domain([1900, 2003])
				.rangeRound([0,210]))
			.barWidth(1)
		]
	cCharts = [
		circleChart()
			.dimension(onhour)
			.group(onhours)
			.label(['12AM', '6AM', '12PM', '6PM']),

		circleChart()
			.dimension(offhour)
			.group(offhours)
			.label(['12AM', '6AM', '12PM', '6PM'])	
	];
	

	d3.selectAll("#total")
			.text(swjlIndexs.size());




	function render(method){
		d3.select(this).call(method);
	}


	var oldFilterObject = {};
	swjlIndexs.all().forEach(function(d){ oldFilterObject[d.key] = d.value; });
	var arr=[0];
	renderAll = function(){
		bChart.each(render);
		cChart.each(render);
		var jl_count=0;//计算记录条数
		var netbar_count=0;//网吧个数
		var inorout_count=[0,0];//内外省
		var manorwoman_count=[0,0];//男女

		zoomRender = false;
		//console.log(tornadoIndexs);
		if(arr[0]==0){
			//console.log("第一次加载");
		}else{
			arr[0].hide();
		}
		newFilterObject = {};
		swjlIndexs.all().forEach(function(d){ 
			newFilterObject[d.key] = d.value; });
			
		//console.log("开始",myDate.toLocaleTimeString());
		for(var i in tmp_bars){
			tmp_bars[i].flag=0;
			tmp_bars[i]['list'][0]=0;
			tmp_bars[i]['list'][1]=0;
		}
		for(var i in newFilterObject){
			if(newFilterObject[i]==1){
				tmp_bars[swjl[i].SITE]['list'][swjl[i].AREA]++;
				tmp_bars[swjl[i].SITE].flag=1;
				inorout_count[swjl[i].AREA]++;
				manorwoman_count[swjl[i].SEX]++;
				jl_count++;//记录条数++
			}
		}
		var pointset=[];
		
		for(var i in tmp_bars){
			if(tmp_bars[i].flag==0){
				continue;
			}
			var tmp_data={};
			tmp_data['SITE']=i;
			tmp_data['AREA']=tmp_bars[i]['list'];
			tmp_data['lng']=tmp_bars[i].lng;
			tmp_data['lat']=tmp_bars[i].lat;
			
			pointset.push(tmp_data);
		}
		netbar_count=pointset.length;
		//console.log("结束",myDate.toLocaleTimeString());
//		console.log(pointset);

		var max_count=-1;
		for (var i = 0; i <pointset.length; i++) {
				if(pointset[i]['AREA'][0]+pointset[i]['AREA'][1]>max_count){
					max_count=pointset[i]['AREA'][0]+pointset[i]['AREA'][1];
				}
			}
		
		var ranrandomCount = pointset.length;

		//var palegreen = d3.rgb(174, 220, 188); //浅绿  
		var palegreen = d3.rgb(66,251,75);
		var darkgreen = d3.rgb(2,100,7);  
			//var darkgreen = d3.rgb(62, 183, 108);//深绿  
		  
			var colorlinear = d3.interpolate(palegreen,darkgreen); 
			       //颜色插值函数

			var linear = d3.scale.linear()  
		        .domain([0, 1])  
		        .range([0, 1]); 

		    var crlinear = d3.scale.linear();
		    var opacitylinear = d3.scale.linear();
			crlinear.domain([0,max_count]).range([3,15]);
			opacitylinear.domain([0,max_count]).range([0.6,1]);
			function hexToRgba(hex, opacity) { 
				return "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt("0x" + hex.slice(5, 7)) + "," + opacity + ")"; 
			}

        	
        	var data = [];
        	var intensity = new mapv.utilDataRangeIntensity({
			    maxSize: 100, // 定义最大的半径大小值
			    max: max_count // 最大权重值
			});
        	
        	while (ranrandomCount--) {
        		var count1 = pointset[ranrandomCount]["AREA"][0];
        		var count2 = pointset[ranrandomCount]["AREA"][1];
        		var count = pointset[ranrandomCount]["AREA"][0]+pointset[ranrandomCount]["AREA"][1];
        		var opacitycl = opacitylinear(count);
        		var coloring = colorlinear(linear(count1/count));
        		var rgba=hexToRgba(coloring,opacitycl);
	            data.push({
	                geometry: {
	                    type: 'Point',
	                    coordinates: [pointset[ranrandomCount].lng, pointset[ranrandomCount].lat]
	                },
	                fillStyle:rgba,
	                size: crlinear(count),
	                time: 100 * Math.random()
	            });
	        }

        	var dataSet = new mapv.DataSet(data);
        	

			var options = {
		            fillStyle: 'rgba(255, 50, 50, 0.5)',
		            globalCompositeOperation: "destination-over",
		            //size: ;
		            mixBlendMode: 'soft-light',
		            shadowBlur: 10,
		            globalAlpha: 1,
		            lineWidth: 4,
		            shadowBlur: 35,
		            draw: 'bubble'
		        }
		        
        	
        	var mapvLayer = new mapv.baiduMapLayer(map, dataSet, options);
        	arr[0]=mapvLayer;
        	

		

		oldFilterObject = newFilterObject;
		
		// update dealths/distance/ect
		
		d3.select("#num").text(
			d3.format(',')(jl_count));
		d3.select("#miles").text(
			d3.format(',')(netbar_count));
		d3.select("#inj").text(
			d3.format(',.4f')(inorout_count[0]/(inorout_count[0]+inorout_count[1])));
   
	}

    
	window.breset = function(i){
		bCharts[i].filter(null);
		zoomRender = true;
		renderAll();
	}
	window.creset = function(i){
		cCharts[i].filter(null);
		zoomRender = true;
		renderAll();
	}

	var bChart = d3.selectAll(".bChart")
			.data(bCharts)
			.each(function(chart){ chart.on("brush", renderAll).on("brushend", renderAll) });
	
	var cChart = d3.selectAll(".cChart")
			.data(cCharts)
			.each(function(chart){ chart.on("brush", renderAll).on("brushend", renderAll) });

	renderAll();

	//remove extra width ticks (there is a better way of doing this!)
	d3.select('#width-chart').selectAll('.major')
			.filter(function(d, i){ return i % 2; })
			.selectAll('text')
			.remove();

	d3.select('#inj-chart').selectAll('.major')
			.filter(function(d, i){ return !(i % 2); })
			.selectAll('text')
			.remove();
}