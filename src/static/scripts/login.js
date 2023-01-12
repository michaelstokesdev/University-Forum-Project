function submitLogin(){
    $("#alertBox").hide();
    $("#loginSpinner").show();
    $.post("/login",
    {
        username: $("#username").val(),
        password: $("#password").val()
    },
    function(res){
        if(res == "success"){
            window.location.replace("/")
        }
        else if(res == "wrong_pass"){
            $("#alertBox").text("Password is incorrect");
            $("#alertBox").show();
        }
        else if(res == "invalid_user"){
            $("#alertBox").text("User does not exist");
            $("#alertBox").show();
        }
        $("#loginSpinner").hide();
    });
}