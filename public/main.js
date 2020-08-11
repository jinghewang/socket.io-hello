/**
 * get token
 * @author wjh 2020-8-12
 * @returns {number}
 */
const getToken = function () {
    let timestamp = (new Date()).valueOf();
    return timestamp;
};



function getVueDataset(event,attribute) {
    let elem = event.currentTarget.attributes['data-' + attribute];
    if (elem)
        return elem.value;
    else
        return '';
}
