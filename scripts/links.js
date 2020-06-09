function GetHyperlinks() {
    var links = [];
    var host = location.host;
    var origin = location.origin;
    var baseurl = location.origin + location.pathname;
    
    $('a').each(function() {
        var href = undefined;
        var is_internal = undefined;
        var linktype = '';
        var count_level = 0;

        try {
            var url = new URL(this.href, baseurl);
            is_internal = (url.host === host);
            href = this.href;

            href = href.replace(baseurl, ''); //to get the anchors
            href = href.replace(origin, ''); //to get internal pages without origin. 

            count_level = GetString(url.pathname).split('/').filter(function(str) {
                return str !== '';
            }).length;

            switch(url.protocol) {
                case 'https:':
                    linktype = 'url (secure)';
                    break;
                case 'http:':
                    linktype = 'url (not secure)';
                    break;
                case 'mailto:':
                    linktype = 'email';
                    break;
                case 'javascript:':
                    linktype = 'script';
                    break;
            }

            if(url.hash !== "") {
                linktype = 'anchor'
            }
        } catch(_) {
            href = undefined;
        }

        var link = links.find(link => link.href === href);

        if(link !== undefined) {
            link.count += 1;
        } else {
            links.push({
                'count': 1,
                'href': href,
                'internal': is_internal,
                'title': this.title,
                'type': linktype,
                'level': count_level
            });
        }
    });

    return {
        'count': {
            'all': links.map(link => link.count).reduce((a, c)=> a + c, 0),
            'all_unique': links.length,
            'internal': links.filter(link => link.internal === true).map(link => link.count).reduce((a, c)=> a + c, 0),
            'internal_unique': links.filter(link => link.internal === true).length,
            'external': links.filter(link => link.internal === false).map(link => link.count).reduce((a, c)=> a + c, 0),
            'external_unique': links.filter(link => link.internal === false).length,
            'missing': links.filter(link => link.href === undefined).map(link => link.count).reduce((a, c)=> a + c, 0)   
        },
        'links': links
    };
}