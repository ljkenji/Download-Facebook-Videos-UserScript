// ==UserScript==
// @name         Download Facebook Videos
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Userscript supports downloading videos from Facebook web
// @author       Lj Kenji (https://github.com/ljkenji)
// @match        *://www.facebook.com/*
// @match        *://mbasic.facebook.com/groups/*
// @match        *://*.fbcdn.net/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const currentUrl = window.location.href;
    let actionValue = "";

    // Add a button to download FB video on www.facebook.com
    if (/^(https?:\/\/).*www\.facebook\.com\//.test(currentUrl)) {
        const downloadFbVideoButton = document.createElement('button');
        downloadFbVideoButton.textContent = 'Download FB Video';
        downloadFbVideoButton.style.position = 'fixed';
        downloadFbVideoButton.style.background = '#efefef';
        downloadFbVideoButton.style.color = 'red';
        downloadFbVideoButton.style.padding = '3px 7px';
        downloadFbVideoButton.style.bottom = '50px';
        downloadFbVideoButton.style.left = '20px';
        downloadFbVideoButton.style.zIndex = '1000';
        downloadFbVideoButton.style.cursor = 'pointer';
        downloadFbVideoButton.style.border = '1px solid #767676';
        downloadFbVideoButton.style.borderRadius = '3px';
        downloadFbVideoButton.style.boxShadow = 'none';
        downloadFbVideoButton.style.font = '12px sans-serif';
        downloadFbVideoButton.style.userSelect = 'none';
        downloadFbVideoButton.addEventListener('click', async function () {
            const ids = extractIdsFromUrl(currentUrl);
            if (!ids) return;
            const mbasicUrl = `https://mbasic.facebook.com/groups/${ids.groupId}/permalink/${ids.postId}/?action=autodownload`;

            window.open(mbasicUrl, '_blank');
        });
        var reachButton = document.querySelector('span[aria-label="See who reacted to this"]');
        // if (reachButton) {
        // reachButton.parentNode.append(downloadFbVideoButton);
        // }
        document.body.appendChild(downloadFbVideoButton);
    }

    // Process autodownload action on mbasic.facebook.com/groups
    if (/^(https?:\/\/).*mbasic\.facebook\.com\/groups\//.test(currentUrl)) {
        actionValue = getQueryStringValue(currentUrl, 'action');
        if (actionValue === 'autodownload') {
            const videoLink = document.querySelector('a[href^="/video_redirect/?src="]');
            if (videoLink) {
                const encodedUrl = new URLSearchParams(videoLink.search).get('src');
                if (encodedUrl) {
                    const decodedUrl = decodeURIComponent(encodedUrl);
                    window.location.href = addQueryString(decodedUrl, 'action=autodownload');
                }
            }
        }
    }

    // Process autodownload action on *.fbcdn.net
    if (/^(https?:\/\/).*\.fbcdn\.net\//.test(currentUrl)) {
        actionValue = getQueryStringValue(currentUrl, 'action');
        if (actionValue === 'autodownload') {
            const videoElement = document.querySelector('video');
            if (videoElement) {
                if (!videoElement.paused) {
                    videoElement.pause();
                }
                const videoUrl = videoElement.querySelector('source').getAttribute('src');
                const downloadLink = document.createElement('a');
                downloadLink.href = videoUrl;
                downloadLink.download = 'video.mp4';
                downloadLink.style.display = 'none';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } else {
                console.log('Could not find the <video> tag in the HTML.');
            }
        }
    }

    // Extract group ID and post ID from URL
    function extractIdsFromUrl(url) {
        const groupIdPattern = /facebook\.com\/groups\/(\d+|[\w-]+)\//;
        const postIdPattern1 = /multi_permalinks=(\d+)/;
        const postIdPattern2 = /\/posts\/(\d+)\//;
        const groupIdMatch = url.match(groupIdPattern);
        let postIdMatch = url.match(postIdPattern1) || url.match(postIdPattern2);
        if (!groupIdMatch || !groupIdMatch[1]) {
            console.error('Could not find the group ID in the URL.');
            return null;
        }
        if (!postIdMatch || !postIdMatch[1]) {
            console.error('Could not find the post ID in the URL.');
            return null;
        }
        return { groupId: groupIdMatch[1], postId: postIdMatch[1] };
    }

    // Add query string to URL
    function addQueryString(url, queryString) {
        return url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
    }

    // Get query string value from URL
    function getQueryStringValue(url, key) {
        const startIndex = url.indexOf('?');
        if (startIndex === -1) return null;
        const params = new URLSearchParams(url.substring(startIndex + 1));
        return params.get(key);
    }

})();
