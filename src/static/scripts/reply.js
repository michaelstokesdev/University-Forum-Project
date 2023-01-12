function reply(postID){
    $("#alertBox").hide();
    $.post("/reply",
    {
        reply: $("#replyText").val(),
        id: postID
    },
    function(res){
        if(res == "success"){
            window.location.reload();
        }
        else if(res == "invalid_post"){
            $("#alertBox").text("Post does not exist");
            $("#alertBox").show();
        }
        else if(res == "not_logged_in"){
            $("#alertBox").text("Not logged in");
            $("#alertBox").show();
        }
    });
}