function deleteUser(userID){
    $.post("/delete-user",
    {
        id: userID
    });
    window.location.reload();
}

function deletePost(postID){
    $.post("/delete-post",
    {
        id: postID
    });
    window.location.reload();
}