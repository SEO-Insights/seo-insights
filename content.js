chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.from === 'popup') {
        switch (message.subject) {
            case 'initialization':
                console.log('Init called!');

                console.log(Hyperlinks.GetExternal());

                //output all meta name and property values for debug.
                console.log(GetAllMetaProperties());
                console.log(GetAllMetaNames());

                sendResponse(MetaInformation.GetGeneral());
                break;
            case 'meta':
                var info = {
                    'article': MetaInformation.GetArticle(),
                    'opengraph': MetaInformation.GetOpenGraph(),
                    'parsely': MetaInformation.GetParsely(),
                    'twitter': MetaInformation.GetTwitter()
                };

                sendResponse(info);
                break;
            case 'headings':
                var info = {
                    'heading': GetHeadings()
                };

                sendResponse(info);
                break;
            case 'images':
                var info = {
                    'images': GetImages()
                };

                sendResponse(info);
                break;
            case 'links':
                sendResponse(Hyperlinks.GetAll());
                break;
            case 'files':
                var info = {
                    'stylesheet': FileInformation.GetStylesheetFiles(),
                    'javascript': FileInformation.GetJavaScriptFiles()
                };

                sendResponse(info);
                break;
        }
    }
});