// ==UserScript==
// @name         YouTube评论翻译器
// @description  自动翻译并展开YouTube评论
// @version      1.0.0
// @author       念柚
// @namespace    https://github.com/MiPoNianYou/UserScripts
// @license      GPL-3.0
// @match        https://www.youtube.com/watch*
// @connect      translate.google.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    const Config = {
        TargetLang: 'zh-CN',
        ObserverConfig: { childList: true, subtree: true },
        ExpandRetry: { Interval: 200, Attempts: 3 }
    };

    const TranslatedNodes = new WeakSet();

    function QueryExpandButton(CommentNode) {
        return CommentNode.querySelector('span.more-button');
    }

    function AutoExpand(CommentNode, Attempt = 1) {
        const Btn = QueryExpandButton(CommentNode);
        Btn?.click() || Attempt <= Config.ExpandRetry.Attempts &&
            setTimeout(AutoExpand, Config.ExpandRetry.Interval * Attempt, CommentNode, Attempt + 1);
    }

    async function TranslateText(Text) {
        const Url = `https://translate.google.com/translate_a/single?client=gtx&sl=auto&tl=${Config.TargetLang}&dt=t&q=${encodeURIComponent(Text)}`;
        return new Promise(Resolve => GM_xmlhttpRequest({
            method: 'GET',
            url: Url,
            onload: Response => {
                const Result = JSON.parse(Response.responseText)[0]?.map(Item => Item[0]).join('') || null;
                Resolve(Result);
            },
            onerror: Error => {
                console.error('翻译失败:', Error);
                Resolve(null);
            }
        }));
    }

    async function ProcessComment(CommentNode) {
        if (TranslatedNodes.has(CommentNode)) return;
        TranslatedNodes.add(CommentNode);

        AutoExpand(CommentNode);
        const ContentNode = CommentNode.querySelector('#content-text');
        if (!ContentNode) return;

        const OriginalText = ContentNode.textContent.trim();
        ContentNode.textContent = '翻译中...';

        setTimeout(async () => {
            const TranslatedText = await TranslateText(OriginalText) || OriginalText;
            ContentNode.innerHTML = `
                <div style="color:#666;font-size:0.9em">原文：</div>
                <div style="margin-bottom:6px">${OriginalText}</div>
                <hr style="margin:4px 0;border-color:#ddd">
                <div style="color:#666;font-size:0.9em">译文：</div>
                <div>${TranslatedText}</div>
            `;
            AutoExpand(CommentNode);
        }, 300);
    }

    function InitObserver() {
        const Observer = new MutationObserver(Mutations => {
            Mutations.flatMap(Mutation => [...Mutation.addedNodes])
                .filter(Node => Node.nodeType === 1 && Node.matches('ytd-comment-thread-renderer'))
                .forEach(Node => setTimeout(ProcessComment, 500, Node));
        });

        const Container = document.querySelector('ytd-item-section-renderer#sections');
        Container ? Observer.observe(Container, Config.ObserverConfig) : setTimeout(InitObserver, 1000);
    }

    setTimeout(InitObserver, 3000);
})();
