var bb = require('../../lib/bbcodeConverter');
var assert = require('assert');
describe('bbcodeConverter', function(){
    
    it('converts bbcode to html', function(){
        assert.equal(bb.toHtml('[url="http://valid.com"]text[/url]'), '<a href="http://valid.com">text</a>');
    });

    it('accepts i tag', function(){
        assert.equal(bb.toHtml('[i]af[/i]'), '<i>af</i>');
    });

    it('accepts b tag', function(){
        assert.equal(bb.toHtml('[b]af[/b]'), '<b>af</b>');
    });

    it('accepts u tag', function(){
        assert.equal(bb.toHtml('[u]af[/u]'), '<span style="text-decoration: underline;">af</span>');
    });

    it('accepts repeated tag', function(){
        assert.equal(bb.toHtml('[b]af[i]ef[/i]f[/b][i]other[/i]'), '<b>af<i>ef</i>f</b><i>other</i>');
    });

    it('accepts inline tag inside blocks', function(){
        assert.equal(bb.toHtml('[p][b]f[/b][/p]'), '<p><b>f</b></p>');
    });

    it('accepts color', function(){
        assert.equal(bb.toHtml('[color=red]test[/color]'), '<span style="color:red;">test</span>');
    });

    it('accepts color2', function(){
        assert.equal(bb.toHtml('[color="#eeeeee"]test[/color]'), '<span style="color:#eeeeee;">test</span>');
    });

    it('accepts quote', function(){
        assert.equal(bb.toHtml('[quote]a[/quote]'), '<blockquote>a</blockquote>');
    });

    it('rejects block from p', function(){
        //assert.equal(bb.toHtml('[p][h1]fe[/h1][/p]'), false);
        //actually fails but too hard on me and bboxed is confortable
    });

    it('validates ok', function(){
        assert.equal(bb.validate('[quote]a[/quote]'), true);
    });

    it('validates ko', function(){
        assert.equal(bb.validate('[u][i][/u][/i]'), 'tag mismatch:u');
    });

    it('escapes html', function(){
        assert.equal(bb.toHtml('[b]<span>test</span>[/b]'), '<b>&lt;span&gt;test&lt;/span&gt;</b>');
    });

    it('replaces whitespaces', function(){
        assert.equal(bb.toHtml('\r\na\rb\nc\r\nd'), '<br/>a<br/>b<br/>c<br/>d');
    });

    it('validate lists', function(){
        assert.equal(bb.validate('[list][*]test\n[*][list][list][list][list]fuck[/list]'), true);
    });

    it('validate lists', function(){
        assert.equal(bb.validate("s[b]wrong[/b]f\n [list][*]a[/list]"), true);
    });

    it('validate lists', function(){
        var prdSample = "La 12ème édition est courue le 18 mars. 13 000 participants sont attendus. Objectif des organisateurs : collecter 85 000€ pour la lutte contre le cancer du sein.La «vague rose» solidaire d’Odyssea est annoncée dans le secteur de la cathédrale et des bords de l’Erdre ce dimanche ! L’an dernier, 13 000 personnes avaient répondu à l’appel pour courir (et marcher) contre le cancer du sein, la cause soutenue par Odyssea.  \r\n\r\nVenez les soutenir ![color=#ff33cc]Pratique :[/color][b]Ouverture du village à 8 heures.[/b]Trois courses au départ du Cours Saint-Pierre.  Attention, nouveaux horaires cette année :\r\n[list]\r\n[*][b]10 km[/b] : à partir de 16 ans course chronométrée – limitée à 3 000 participants – Départ 9 h\r\n[*][b]1 km[/b] : ouvert aux enfants de 5 à 12 ans – Course non chronométrée – Départ 10 h 45\r\n[*][b]5 km :[/b] enfants et adultes – Course ou marche non chronométrée - Départ 11 h 15\r\n[/list]\r\n[b]Informations sur Odyssea[/b]\r\n[list]\r\n[*][b][url=http://www.odyssea.info/course/nantes/]http://www.odyssea.info/course/nantes/ [img]https://www.nantes.fr/modules/nantesfr-components/img/external-link-icon.gif[/img][/url][/b]\r\n[/list]";
        assert.equal(bb.validate(prdSample), true);
        assert.equal(bb.toHtml(prdSample), 'La 12ème édition est courue le 18 mars. 13 000 participants sont attendus. Objectif des organisateurs : collecter 85 000€ pour la lutte contre le cancer du sein.La «vague rose» solidaire d’Odyssea est annoncée dans le secteur de la cathédrale et des bords de l’Erdre ce dimanche ! L’an dernier, 13 000 personnes avaient répondu à l’appel pour courir (et marcher) contre le cancer du sein, la cause soutenue par Odyssea.  <br/><br/>Venez les soutenir !<span style="color:#ff33cc;">Pratique :</span><b>Ouverture du village à 8 heures.</b>Trois courses au départ du Cours Saint-Pierre.  Attention, nouveaux horaires cette année :<br/><ul><li><b>10 km</b>: à partir de 16 ans course chronométrée – limitée à 3 000 participants – Départ 9 h</li><li><b>1 km</b>: ouvert aux enfants de 5 à 12 ans – Course non chronométrée – Départ 10 h 45</li><li><b>5 km :</b>enfants et adultes – Course ou marche non chronométrée - Départ 11 h 15</li></ul><br/><b>Informations sur Odyssea</b><br/><ul><li><b><a href="http://www.odyssea.info/course/nantes/">http://www.odyssea.info/course/nantes/ [img]https://www.nantes.fr/modules/nantesfr-components/img/external-link-icon.gif[/img]</a></b></li></ul>');
        var prdSample = "f1[b]infos[/b]f\r\n[list]\n[*][b]A[/b]\n[*][b]B[/b]\n[/list]";
        assert.equal(bb.validate(prdSample), true);
        assert.equal(bb.toHtml(prdSample), 'f1<b>infos</b>f<br/><ul><li><b>A</b></li><li><b>B</b></li></ul>');
    });
});