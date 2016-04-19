function generateDashboard(data,geom){
    var map = new lg.map('#map').geojson(geom).nameAttr('DPA_DESCAN').joinAttr('DPA_CANTON').zoom(7).center([-1.8312,-78]);

    var severity = new lg.column('#indicator+category')
                        .label('Severity Category')
                        .axisLabels(false)
                        .valueAccessor(function(d){
                            return +d;
                        })
                        .colorAccessor(function(d,i,max){
                            return +d-1;
                        });

    var deaths = new lg.column("#affected+deaths").label("Deaths");
    
    var wounded = new lg.column("#affected+wounded").label("Wounded");

    var inshelter = new lg.column("#affected+inshelter").label("In Shelter");

    var destroyed = new lg.column("#affected+buildings+destroyed").label("Buildings Destroyed");

    var partially = new lg.column("#affected+buildings+partially").label("Buildings Partially Destroyed");                       

    var grid1 = new lg.grid('#grid1')
        .data(data)
        .width($('#grid1').width())
        .height(1800)
        .nameAttr('#adm2+name')
        .joinAttr('#adm2+code')
        .hWhiteSpace(4)
        .vWhiteSpace(4)
        .margins({top: 150, right: 20, bottom: 30, left: 200})
        .columns([severity,deaths,wounded,inshelter,destroyed,partially]);            

    lg.colors(["#FFCDD2","#E57373","#F44336","#D32F2F","#B71C1C"]);

    lg.init();

    $("#map").width($("#map").width());
}

function hxlProxyToJSON(input,headers){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();                    
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

function stickydiv(){
    var window_top = $(window).scrollTop();
    var div_top = $('#sticky-anchor').offset().top;
    if (window_top > div_top){
        $('#map-container').addClass('sticky');
    }
    else{
        $('#map-container').removeClass('sticky');
    }
};

$(window).scroll(function(){
    stickydiv();
}); 

//load data

var dataCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?merge-keys01=%23adm2%2Bcode&strip-headers=on&filter01=merge&merge-url01=https%3A//docs.google.com/spreadsheets/d/1klRixK82iRk1JnDOpAqKrry4VQiFcTGrfFZWr9ih-Z8/pub%3Fgid%3D777123392%26single%3Dtrue%26output%3Dcsv&url=https%3A//docs.google.com/spreadsheets/d/1OlxhQ_ejRKNvohbnfJ7yJPKD6U6pXcPPfsFnwBbP2nc/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv&filter02=select&select-query02-01=%23indicator%2Bcategory%21%3D1&merge-tags01=%23affected%2Bdeaths%2C%23affected%2Bmissing%2C%23affected%2Bwounded%2C%23affected%2Binshelter%2C%23affected%2Bbuildings%2Bdestroyed%2C%23affected%2Bbuildings%2Bpartially%2C%23affected%2Bschools', 
    dataType: 'json',
});

//load geometry

var geomCall = $.ajax({ 
    type: 'GET', 
    url: 'data/geom.json', 
    dataType: 'json',
});

//when both ready construct dashboard

$.when(dataCall, geomCall).then(function(dataArgs,geomArgs){
    geom = topojson.feature(geomArgs[0],geomArgs[0].objects.geom);
    overview = hxlProxyToJSON(dataArgs[0],false);
    generateDashboard(overview,geom);
});
