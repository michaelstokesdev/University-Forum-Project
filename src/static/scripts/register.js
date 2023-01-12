function registerUser(){
    $("#alertBox").hide();
    $("#registerSpinner").show();
    $.post("/register",
    {
        username: $("#username").val(),
        password: $("#password").val()
    },
    function(res){
        if(res == "success"){
            window.location.replace("/")
        }
        else if(res == "duplicate_user"){
            $("#alertBox").text("Username is already taken");
            $("#alertBox").show();
        }
        else if(res == "password_too_short"){
            $("#alertBox").text("Password too short");
            $("#alertBox").show();
        }
        $("#loginSpinner").hide();
    });
}