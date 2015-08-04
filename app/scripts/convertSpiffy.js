(function() {
    'use strict';
    window.folhaArte = window.folhaArte || {};

    folhaArte.codeSpiffy = {
        url: '',
        title: '',
        width: '620',
        height: '',
        type: ''
    };

    var error = [];

    var codeHtml = $('#converterSpiffy #code').change(function(event) {
        error = [];
        if (codeHtml.val().indexOf('iframe') > -1) {
            console.log('sou um iframe');
            convertIframe(codeHtml.val());
        } else if (codeHtml.val().indexOf('p(artHtml5)') > -1 || codeHtml.val().indexOf('p(folhagraficos)') > -1) {
            console.log('sou um código spiffy');
            convertSpiffy(codeHtml.val());
        } else if (codeHtml.val().indexOf('http') === 0 || codeHtml.val().indexOf('//') === 0 ) {
            console.log('sou um link');
            convertLink(codeHtml.val());
        } else {
            error.push('Você está fazendo algo de errado');
            callError();
        }
    });

    var convertTableau = function(code) {
    	var objS = folhaArte.codeSpiffy;

      objS.type = 'artHtml5';

      objS.url = checkUrl(code.substring(code.indexOf(':')+1, code.indexOf('?')));

      objS.width = checkWidth( code.substring(code.indexOf('w=')+2, code.indexOf('&h=')) );
      objS.height = code.substr(code.indexOf('&h=')+3);


      console.log(objS);
      writeInputs();
    };

    var convertLink = function(code) {
    	var objS = folhaArte.codeSpiffy;

      objS.url = checkUrl(code);


      console.log(objS);
      writeInputs();
    };

    var convertSpiffy = function(code) {
    	var objS = folhaArte.codeSpiffy;

      objS.type = code.match(/\(([^)]+)\)/)[1];

      objS.title = code.match(/\[([^)]+)\]/)[1];

      objS.url = checkUrl(code.substring(code.indexOf(':')+1, code.indexOf('?')));

      objS.width = checkWidth( code.substring(code.indexOf('w=')+2, code.indexOf('&h=')) );
      objS.height = code.substr(code.indexOf('&h=')+3);


      console.log(objS);
      writeInputs();
    };

    var callError = function() {
        $('.alert ul').empty();
        if (!error.length) {
            $('.alert').addClass('hidden');
        } else {
            console.log(error);
            $('.alert').removeClass('hidden');

            for (var i = 0; i < error.length; i++) {
                $('.alert ul').prepend('<li>' + error[i] + '</li>');
            }
            $('#result').html('<span>o codigo vai aparecer aqui.</span>');
        }
    };
    var convertIframe = function(code) {
        var tempCode = code.replace('<iframe ', '').replace('</iframe>', '').replace('>', '').replace('/>', '').split(' ');
        console.log(tempCode);
        for (var i = tempCode.length - 1; i >= 0; i--) {
            var objS = folhaArte.codeSpiffy;
            if (tempCode[i].indexOf('src=') > -1) {
                objS.url = checkUrl(tempCode[i]);
            }
            if (tempCode[i].indexOf('width=') > -1) {
                objS.width = checkWidth(tempCode[i].match(/"(.*?)"/)[1]);
            }
            if (tempCode[i].indexOf('height=') > -1) {
                objS.height = tempCode[i].match(/"(.*?)"/)[1];
            }
        }
        console.log(folhaArte.codeSpiffy);
        writeInputs();
    };

    var checkWidth = function(width) {
        console.log(width);
        if (Number(width) > 620  || width.indexOf('%')>-1 ) {
            width = 620;
        }

        return width;
    };

    var checkType = function(url, typeI) {
        if (!typeI) {
            typeI = 'others';
        }
        var type = 'artHtml5';

        if (url.indexOf('/graficos/') > -1) {
            type = 'folhagraficos';
        }
        if (typeI === 'edge' || typeI === 'folhagraficos') {
            type = 'folhagraficos';
        }

        return type;
    };
    var checkUrl = function(codeUrl) {
        console.log(codeUrl);
        var url = codeUrl.indexOf('"') === -1 ? codeUrl : codeUrl.match(/"(.*?)"/)[1];

        if (url.indexOf('//') === 0) {
            url = 'http:' + url;
        }
        if (url.indexOf('google') > -1 && url.indexOf('output=embed') === -1) {
            url = url + '&output=embed';
        }
        if (url.indexOf('tableau') > -1 && url.indexOf(':showVizHome=no') === -1) {
            url = url + '&:showVizHome=no';
        }

        folhaArte.codeSpiffy.type = checkType(url);

        return url;
    };

    var checkTitle = function(codeTitle) {
        var title = '';
        if (codeTitle.split(' ').length > 1) {
            title = codeTitle;
        } else {
        	error.push('Coloque um titulo mais claro, por favor');
        }
        return title;
    };

    $('input[type=radio][name=type]').change(function(event) {
        folhaArte.codeSpiffy.type = checkType(folhaArte.codeSpiffy.url, this.value);
        writeSpiffycode();
    });
    $('#title, #width, #height, #url').keyup(function(event) {
        $('#width').val(checkWidth($('#width').val()));
        folhaArte.codeSpiffy.title = checkTitle( $('#title').val());
        folhaArte.codeSpiffy.width = $('#width').val();
        folhaArte.codeSpiffy.height = $('#height').val();
        folhaArte.codeSpiffy.url = checkUrl($('#url').val());

        writeSpiffycode();
    });


    var writeInputs = function() {
        var objS = folhaArte.codeSpiffy;
        $('#title').val(objS.title);
        $('#width').val(objS.width);
        $('#height').val(objS.height);
        $('#url').val(objS.url);
        writeSpiffycode();
    };
    var writeSpiffycode = function() {
        error = [];
        if ($('#title').val() && $('#width').val() && $('#height').val() && $('#url').val()) {
            var template = 'p({{typeChart}}). "[{{titleChart}}]":{{urlChart}}?w={{w}}&h={{h}}';
            var objS = folhaArte.codeSpiffy;

            var codeSpiffy = template.replace('{{typeChart}}', objS.type)
                .replace('{{titleChart}}', objS.title)
                .replace('{{urlChart}}', objS.url)
                .replace('{{w}}', objS.width)
                .replace('{{h}}', objS.height);

            console.log(codeSpiffy);
            $('#result').text(codeSpiffy);
            $('.alert').removeClass('hidden');
        } else {
            $('.alert').addClass('hidden');
            error.push('Você não preencheu todos os campos necessários.');
        }
        callError();
    };
})();
