window.addEventListener("load", function () {
    tinymce.init({
        selector: '#createArticleTextArea, #editArticleTextArea'
    });

});

function createNotEmpty(){
    if ((tinymce.EditorManager.get("createArticleTextArea").getContent()) == "") {
        window.alert("Article must not be empty")
        return false;
    }
}

function editNotEmpty(){
    if ((tinymce.EditorManager.get("editArticleTextArea").getContent()) == "") {
        window.alert("Article must not be empty")
        return false;
    }
}