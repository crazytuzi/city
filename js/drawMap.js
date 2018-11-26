var myDate = new Date();
console.log("开始时间",myDate.toLocaleTimeString());
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

 
/*

var width = 960,
	height = 600,

var proj = d3.geo.azimuthalEqualArea()
    .scale(width)
    .translate([33.5, 262.5])
    .rotate([100, -45])
    .center([-17.6076, -4.7913]) // rotated [-122.4183, 37.7750]
    .scale(1297);


var path = d3.geo.path().projection(proj);


var svg = d3.select("#map").append("svg")
		.attr("width", width)
		.attr("height", height)

var g = svg.append("g");



*/
var opacity = 0.8;
			var width  = 800;
			var height = 800;
			
			
			var svg = d3.select("#map").append("svg")
			    .attr("width", width)
			    .attr("height", height)
			    .attr("transform", "translate(0,0)")
			    .attr("id","allmap");

			//设置缩放
			var zoom = d3.behavior.zoom()
					.scaleExtent([1, 10])
					.on("zoom", zoomed);
			
			
			//设置地理投影
			var projection = d3.geo.mercator()
								.center([106, 29])
								.scale(8000)
		    					.translate([150, 550]);
			
			//创建一个新的地理路径生成器
			var path = d3.geo.path()
							.projection(projection);
			
			
			//获取颜色
			var color = d3.scale.category20();

			function zoomed() {
			d3.select(this).attr("transform", 
				"translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		}

	zoomRender = false;

var widthScale = d3.scale.pow().exponent(.5);
var colorScale = d3.scale.linear();
var opacityScale = d3.scale.quantile();

var parseDate = d3.time.format("%x %H:%M").parse;


queue()
	.defer(d3.json,"csv/chongqing.json")
	.defer(d3.csv, "csv/netbars.csv")
	.defer(d3.csv, "csv/drawdata.csv")
	//.defer(d3.json, "us.json")
	.await(intialLoad);

function intialLoad(error,root,netbarsinfo,swjl){
	/*
	直接加载600多w条数据会挂
	用d3.csv也不行
	*/
	var myDate = new Date();
	console.log("开始加载数据",myDate.toLocaleTimeString());
	swjl.forEach(function(t, i){
		['SITE', 'SEX', 'AREA', 'BIRTHYEAR','PERSONID','ON_DAY','HOURS','OFF_DAY','ON_HOUR','OFF_HOUR',
		].forEach(function(field){
			t[field] = +t[field];});
		/*
		index给每个数据标号
		因此不需要上网记录ID
		*/
		t['index'] = i;
		/*
		这里D3的经纬度投影可以考略
		如果用百度地图用不到
		用d3绘图会用到
		t['x1'] = proj([t.slon, t.slat])[0];
		t['y1'] = proj([t.slon, t.slat])[1];
		t['x2'] = proj([t.elon, t.elat])[0];
		t['y2'] = proj([t.elon, t.elat])[1];
		*/
	});
	netbarsinfo.forEach(function(t, i){
		['SITEID','TITLE','lng','lat',
		].forEach(function(field){
			t[field] = +t[field];});		
	
		/*
		index给每个数据标号
		因此不需要上网记录ID
		*/
		t['index'] = i;
	});
	var tmp_bars={};
	for (var i=0;i<netbarsinfo.length;++i) {
		tmp_bars[netbarsinfo[i].SITEID]={}
		tmp_bars[netbarsinfo[i].SITEID].list=[0,0];
		tmp_bars[netbarsinfo[i].SITEID].lat=netbarsinfo[i].lat;
		tmp_bars[netbarsinfo[i].SITEID].lng=netbarsinfo[i].lng;
	}

	//remove those w/o angle
	//tornados = tornados.filter(function(d){ return d.angle != 180; });
	//vtornados = tornados.filter(function(d){ return d.length > 20; });
	
	/*
	widthScale.range([.25, 2.6])
	    .domain(d3.extent(vtornados.map(function(d){ return d.width; })));
	colorScale.range(['blue', 'red'])
			.domain(d3.extent(vtornados.map(function(d){ return d.fscale; })));
	opacityScale.range(d3.range(.3, .8, .1))
	    .domain(vtornados.map(function(d){ return d.fscale; }));
	 */
	    

	//var defs = g.append("defs");

	var groups = svg.append("g").call(zoom);
				var map = groups.selectAll("path")
					.data( root.features )
					.enter()
					.append("path")
					.attr("stroke","#000")
					.attr("stroke-width",1)
					.style("fill", function(d,i){
						return color(i);
					})
					.style("opacity",opacity/2)
					.attr("d", path );
			
/*
    var colorScale = d3.scale.linear();
    var opacityScale = d3.scale.quantile();
    */

    var palegreen = d3.rgb(66,251,75);  //浅绿  
	var darkgreen = d3.rgb(2,100,7);        //深绿  
  
	var colorlinear = d3.interpolate(palegreen,darkgreen); 
	       //颜色插值函数

	var linear = d3.scale.linear()  
        .domain([0, 1])  
        .range([0, 1]); 

    var crlinear = d3.scale.linear();
    var opacitylinear = d3.scale.linear();
	//colorScale.range(['blue', 'red'])  
	/*
	opacityScale.range(d3.range(.3, .8, .1))
	    .domain(0,1);	
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
	console.log("加载数据结束",myDate.toLocaleTimeString());


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
	日期
	*/
	var daydata=swjlCF.dimension(function(d){ return d.ON_DAY; });
	daydatas=daydata.group();
	console.log('日期的数量:',daydatas.size());


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

	var offday = swjlCF.dimension(function(d){ return d.OFF_DAY; });
	offdays=offday.group();

	var onhour = swjlCF.dimension(function(d){ return d.ON_HOUR; });
	onhours=onhour.group();

	var offhour = swjlCF.dimension(function(d){ return d.OFF_HOUR; });
	offhours=offhour.group();




	var Wlb = 1.5;
	tWidth = swjlCF.dimension(function(d){ return d.HOURS; });
	widthLogs = tWidth.group(function(d, i){ 
	 return Math.pow(Wlb, Math.floor(Math.log(d + 1)/Math.log(Wlb))); });

	var Llb = 1.8;
	length = swjlCF.dimension(function(d){ return d.HOURS; });
	//lengths = length.group(function(d, i){ return d3.round(d, -1); });
	lengthLogs = length.group(function(d, i){ 
	 return Math.pow(Llb, Math.floor(Math.log(d + 1)/Math.log(Llb))); });
	
	var Ilb = 2;
	injury = swjlCF.dimension(function(d){ return d.BIRTHYEAR; });

	var bCharts = [
		//上网时长
		barChart()
			.dimension(swsc)
			.group(swscs)
			.x(d3.scale.linear()
				.domain([0, 246])
				.rangeRound([0, 130]))
			.barWidth(2),
					/*
		//上网时长
		barChart()
			.dimension(length)
			.group(lengthLogs)
			.tickFormat(function(d){ return d3.format('.0f')(d-1); })			
			.x(d3.scale.log().base([Llb])
				.domain([1, d3.max(lengthLogs.all().map(function(d, i){ return d.key; }))])
				.rangeRound([0, 190]))
			.barWidth(2),
			*/

		//上网日期
		barChart()
			.dimension(length)
			.group(lengthLogs)
			.x(d3.scale.linear()
				.domain([0, 10])
				.rangeRound([0, 130]))
			.barWidth(2),
			/*
		barChart()
			.dimension(tWidth)
			.group(widthLogs)
			.tickFormat(function(d){ return d3.format('.0f')(d-1); }, )
			.x(d3.scale.log().base([Wlb])
				.domain([1, d3.max(widthLogs.all().map(function(d, i){ return d.key; }))])
				.rangeRound([1, 190]))
			.barWidth(2),
			*/

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
			*/
/*
		barChart()
			.dimension(daydata)
			.group(daydatas)
			.tickFormat(function(d){ return d3.format('.0f')(d-1); })			
			.x(d3.scale.log().base([Llb])
				.domain([1,d3.max(lengthLogs.all().map(function(d, i){ return d.key; }))])
				.rangeRound([0, 190]))
			.barWidth(2),

		barChart()
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
/*
		circleChart()
			.dimension(area)
			.group(areas)
			.label(['本省','', '外省',''])*/
	];
	

	d3.selectAll("#total")
			.text(swjlIndexs.size());




	function render(method){
		d3.select(this).call(method);
	}


	var oldFilterObject = {};
	swjlIndexs.all().forEach(function(d){ oldFilterObject[d.key] = d.value; });

	renderAll = function(){
		bChart.each(render);
		cChart.each(render);

		zoomRender = false;
		//console.log(tornadoIndexs);

		newFilterObject = {};
		swjlIndexs.all().forEach(function(d){ 
			newFilterObject[d.key] = d.value; });
		
		//console.log("开始",myDate.toLocaleTimeString());
		for(var i in newFilterObject){
			if(newFilterObject[i]==1){
				tmp_bars[swjl[i].SITE]['list'][swjl[i].AREA]++;
			}
		}
		var pointset=[];
		
		for(var i in tmp_bars){
			var tmp_data={};
			tmp_data['SITE']=i;
			tmp_data['AREA']=tmp_bars[i]['list'];
			tmp_data['lng']=tmp_bars[i].lng;
			tmp_data['lat']=tmp_bars[i].lat;
			
			pointset.push(tmp_data);
		}
		//console.log("结束",myDate.toLocaleTimeString());
		//console.log(pointset);

		var max_count=-1;
		for (var i = 0; i <pointset.length; i++) {
				if(pointset[i]['AREA'][0]+pointset[i]['AREA'][1]>max_count){
					max_count=pointset[i]['AREA'][0]+pointset[i]['AREA'][1];
				}
			}
		//console.log(max_count);

		//exit animation
		crlinear.domain([0,max_count]).range([3,7]);
		opacitylinear.domain([0,max_count]).range([0,4]);
		
		//画线

		var svg_bars = groups.selectAll(".points").append("g");
				    var barcircle = svg_bars.data(pointset)
							.enter()
							.append("circle")
							.attr("transform",function(d,i){
							  	var arr = [];
							  	arr.push(d.lng);
							  	arr.push(d.lat);
								var coor = projection(arr);	
								//console.log(coor);
								return "translate("+coor[0]+","+coor[1]+")";				    	
							})/*
							.attr("class","barcircle")*/
							.attr("opacity",function(d){
								return opacitylinear(d['AREA'][0]+d['AREA'][1])
							})
							.attr("fill",function(d){
								var temp = d['AREA'][0]/(d['AREA'][0]+d['AREA'][1]);
								//console.log(colorlinear(linear(temp)));
								return colorlinear(linear(temp));
							})
							.attr("r",function(d){
								//console.log(crlinear(d['AREA'][0]+d['AREA'][1]));
								return crlinear(d['AREA'][0]+d['AREA'][1]);
							});
		//对应地图绘点操作
		/*
		lines.filter(function(d){ return oldFilterObject[d.index] > newFilterObject[d.index]; })
				.transition().duration(1400)
					.attr("x1", function(d){ return d.x2; })
					.attr("y1", function(d){ return d.y2; })
				.transition().delay(1450).duration(0)
					.attr('opacity', 0)
					.attr("x1", function(d){ return d.x1; })
					.attr("y1", function(d){ return d.y1; })
					.attr("x2", function(d){ return d.x1; })
					.attr("y2", function(d){ return d.y1; });

		//enter animation
		lines.filter(function(d){ 
			return oldFilterObject[d.index] < newFilterObject[d.index]; 
		})
					.attr('opacity', function(d, i){ return opacityScale(d.fscale); })
				.transition().duration(1400)
					.attr("x2", function(d){ return d.x2; })
					.attr("y2", function(d){ return d.y2; });
		
*/
		oldFilterObject = newFilterObject;
		
		// update dealths/distance/ect
		visable = swjl.filter(function(d){ return newFilterObject[d.index] == 1; });
		d3.select("#num").text(
			d3.format(',')(all.value()));
		d3.select("#miles").text(
			d3.format('')(d3.sum(visable.map(function(d, i){ return d.length; 
				console.log(d.length);}))));
		d3.select("#inj").text(
			d3.format(',')(d3.sum(visable.map(function(d, i){ return d.inj; }))));

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
