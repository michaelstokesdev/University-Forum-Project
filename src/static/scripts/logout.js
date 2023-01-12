function logout(){
    $.post("/logout",{},
    function(res){
        if(res == "logged_out"){
            //if on new post screen redirect to index
            if(window.location.pathname == "/new-post"){
                window.location.replace("/");
            }
            if(window.location.pathname == "/"){
                $("#newPostButton").hide();
                $(".adminButton").hide();
            }
            $("#logoutLink").hide();
            $("#loggedInTag").hide();
            $("#loginLink").show();
            $("#registerLink").show();
        }
    });
}