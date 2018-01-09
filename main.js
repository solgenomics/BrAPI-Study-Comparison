;(function(){
    
    $(document).ready(function(){
        $("#brapi-form").submit(function(){
            var form = $(this).serializeArray().reduce(function(vals,entry){
                vals[entry.name] = entry.value
                return vals
            },{});
            params = {"studyDbIds" : form.study.split(",").map(function(s){return s.trim()}),
                      "observationLevel" : form.unit};
            loadBrAPIData(form.server,params,function(response){
                createSComp(response.result.data);
            },form.username,form.password);
            return false;
        })
    });

    function loadBrAPIData(server,parameters,success,username,password){
        $("#load-spin").show();
        var base_url = server;
        if (base_url.slice(0,8)!="https://" && base_url.slice(0,7)!="http://"){
            base_url ="https://"+base_url;
        }
        if (base_url.slice(-1)!="/"){
            base_url+="/";
        }
        
        var load_url = base_url+"brapi/v1/phenotypes-search";
        var data = {
            "pageSize" : 10000000,
            "page" : 0
        };
        d3.entries(parameters).forEach(function(entry){
            data[entry.key] = data[entry.key]||entry.value;
        });
        
        if(username){
            $.ajax({
                type: "POST",
                url: base_url+"brapi/v1/token",
                data: {'username':username,'password':password},
                success: function(response){
                    data["access_token"] = response.access_token;
                    load();
                },
            });
        }
        else {
            load();
        }
        
        function load(){
            console.log(data);
            $.ajax({
                type: "POST",
                url: load_url,
                data: data,
                success: function(d){$("#load-spin").hide();success(d);},
            });
        }
    };

    function createSComp(data){
        var scomp = StudyComparison();
        var sharedVars = scomp.loadData(data);
        
        var varOpts = d3.select("#scomp-select-var")
                .selectAll("option:not([disabled])")
                .data(sharedVars);
        varOpts.exit().remove();
        varOpts.enter().append("option").merge(varOpts)
                .attr("value",function(d){return d})
                .text(function(d){return d})
                .raise();
                
        
        $("#scomp-form").submit(function(){
                scomp.setVariable($("#scomp-select-var").val());
                scomp.graphGrid("#graph_div");
                scomp.multiHist("#hist_div");
                return false;
        });
    }
    
})();
