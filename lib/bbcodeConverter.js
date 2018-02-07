
function toHtml(field){
    field = field.replace(/\[b\](.+?)\[\/b\]/g, '<strong>$1</strong>');
    field = field.replace(/\[i\](.+?)\[\/i\]/g, '<em>$1</em>');
    field = field.replace(/\[ctr\](.+?)\[\/ctr\]/g, '<div align="center">$1</div>');
    field = field.replace(/\[h1?\](.+?)\[\/h1?\]/g, '<h1>$1</h1>');
    field = field.replace(/\[h2\](.+?)\[\/h2\]/g, '<h2>$1</h2>');
    field = field.replace(/\[h3\](.+?)\[\/h3\]/g, '<h3>$1</h3>');
    field = field.replace(/\[h4\](.+?)\[\/h4\]/g, '<h4>$1</h4>');
    field = field.replace(/\[h5\](.+?)\[\/h5\]/g, '<h5>$1</h5>');
    field = field.replace(/\[h6\](.+?)\[\/h6\]/g, '<h6>$1</h6>');
    field = field.replace(/\[img\](.+?)\[\/img\]/g, '<img src="$1" ');
    field = field.replace(/\[alt\](.+?)\[\/alt\]/g, 'alt="$1" />');
    field = field.replace(/\[url\](.+?)\[\/url\]/g, '<a href="$1">');
    field = field.replace(/\[txt\](.+?)\[\/txt\]/g, '$1</a>');
    field = field.replace(/\[p\](.+?)\[\/p\]/g, '<p>$1</p>');
    return field;
}

function validate(field){
    return true;
}

module.exports = {
    toHtml: toHtml,
    validate: validate
};