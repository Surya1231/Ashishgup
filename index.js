let user_name = null;
let user_contest = {};
let last_render = localStorage.sanket_last_render ? localStorage.sanket_last_render : 'dp';
let last_element = '.sectionhead';
console.log(last_render);

function request(url){
    try{
        console.log("New request filed")
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log("Request completed")
                //localStorage.suryaa_user_contest = xhr.responseText;
                json = JSON.parse(xhr.responseText);
                work(json.result);
            }
        };
        xhr.send();
    }
    catch(error){
        console.log(error);
        return "Surya";
    }
}

function work(json){
    const data = {}
    json.forEach(item => {
        if(item.verdict == "OK"){
            const contest_id = item["problem"]["contestId"];
            const index = item["problem"]["index"];
            const tags = item["problem"]["tags"];
            const id = item["id"];
            const question_url = "https://codeforces.com/contest/"+contest_id+"/problem/"+index
            const solution_url = "https://codeforces.com/contest/"+contest_id+"/submission/"+id
            tags.forEach(tag => {
                if(!data[tag]) data[tag] = []; 
                data[tag].push([question_url , solution_url , item.problem]);
            });
        }
    });

    Object.keys(data).sort().forEach(function(key) {
        main_data[key] = data[key];
    });
    sidenav();
}

function sidenav(){
    var left_list = '<li class="list-group-item active bg-info rounded-0 sectionhead"> Categories <i class="down-arrow float-right mt-1 mr-2"></i></li>';
    for (var key of Object.keys(main_data)) {
        left_list += '<li class="list-group-item menu" onclick="render('+"'"+ key +"'"+',this)">'+key+'</li>'
    }
    $('.left-panel').html(left_list); 
}

function fetch_user(user){
    user_name = user;
    localStorage.sanket_user_name = user_name;
    console.log("Started Fetching info for user");
    var xhr = new XMLHttpRequest();
    var url = "https://codeforces.com/api/user.status?handle="+user_name;
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            //localStorage.surya_user_contest = xhr.responseText;
            fill_user_contest(json);
        }
    };
    xhr.send();
}
  
function fill_user_contest(json){
    user_contest = {};
    if(json.status && json.status == "OK"){
        json.result.forEach(function(item){
        if(item.verdict == "OK"){
            if(!user_contest[item.problem.contestId]) user_contest[item.problem.contestId] = new Set();
            user_contest[item.problem.contestId].add(item.problem.index);
        }
        });
    }
    $('.user_info').html("<span>"+user_name+"</span>");
    render(last_render,last_element);
}


function new_user(){
    var newuser = $('#username').val();
    $('.user_info').html("<span class='text-danger'>"+newuser+"</span>");
    fetch_user(newuser);
}
  

function render(cat,element){
    last_render = cat;
    last_element = element;
    localStorage.sanket_last_render = cat;
    $('.menu').removeClass("list-group-item-primary");
    $(element).addClass("list-group-item-primary");
    var table = "<div class='row'>";
    var tc = 0 , uc = 0;
    main_data[cat].forEach( (item,index) => {
        tc++;
        var spclass = "";
        if(user_name && user_contest[item[2].contestId] && user_contest[item[2].contestId].has( item[2].index)) { spclass = "spclass"; uc++; }
        table+= '<div class="col-md-4"><ul class="list-group my-3 '+spclass+'"><li class="list-group-item active"> <strong>#'+ (index+1) +'</strong> '+ item[2].index +' : '+ item[2].name +'</li>';
        table+= '<li class="list-group-item"> <strong>Question : </strong><a target="_blank" href="'+item[0]+'">'+item[2].name+'</a></li>';
        table+= '<li class="list-group-item"> <strong>Solution : </strong><a target="_blank" href="'+item[1]+'">'+"Ashish Solution"+'</a></li>';
        table+= '<li class="list-group-item "><strong>Tags : </strong>'+ item[2].tags.join(',')+'</li>';
        table+= '<li class="list-group-item "><strong>Rating : </strong>'+item[2].rating+'</li></ul></div>';

    });
    table+="</div>";
    $('.right-panel').html(table);
    $('#topic').html(cat);
    $('.ques').html("Questions : " + uc + '/' + tc);
}


function mob(){
    console.log("Navbar switched");
    $('.sp').toggleClass('supersp');
}

function theme(val){
    console.log("Theme Changed");
    $('.right').toggleClass('ddark');
}

function initial(){
    sidenav();
    console.log(last_render);
    render(last_render,last_element);
    //request("https://codeforces.com/api/user.status?handle=ashishgup");
}


initial();