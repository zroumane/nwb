import '../css/app.scss';

const $q = document.querySelector.bind(document)
const $qa = document.querySelectorAll.bind(document)

//recupere la lang envoyé par le php
window.lang = $q('html').getAttribute('lang')
