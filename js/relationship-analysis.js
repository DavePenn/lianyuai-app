// relationship-analysis.js
// 关系分析模块：输入、提交、结果渲染、历史、聊天上下文注入
// 依赖：showPage, openSecondaryPage, navigateToMainPage, showToast, centerSubPageTitle (from app.js)
// 依赖：window.aiService, window.backendService (from ai-service.js, backend-service.js)
function initRelationshipAnalysis() {
    const form = document.getElementById('relationship-analysis-form');
    const inputBackBtn = document.getElementById('relationship-analysis-back-btn');
    const resultBackBtn = document.getElementById('relationship-analysis-result-back-btn');
    const refreshBtn = document.getElementById('relationship-refresh-btn');
    const backToInputBtn = document.getElementById('relationship-back-to-input-btn');
    const openChatBtn = document.getElementById('relationship-open-chat-btn');
    const returnToAnalysisBtn = document.getElementById('chat-return-to-analysis-btn');
    const repliesList = document.getElementById('relationship-replies-list');
    const fillExampleBtn = document.getElementById('relationship-fill-example-btn');
    const clearFormBtn = document.getElementById('relationship-clear-form-btn');
    const uploadBtn = document.getElementById('relationship-upload-btn');
    const screenshotInput = document.getElementById('relationship-screenshot-input');
    const screenshotsStrip = document.getElementById('relationship-screenshots-strip');
    const MAX_SCREENSHOTS = 10;
    let screenshotIdCounter = 0;

    window.relationshipAnalysisState = window.relationshipAnalysisState || {
        payload: null,
        result: null,
        selectedReply: '',
        sourcePage: 'home',
        screenshots: []
    };

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            await submitRelationshipAnalysis();
        });
    }

    if (inputBackBtn) {
        inputBackBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const inputPage = document.getElementById('relationship-analysis-page');
            if (inputPage && inputPage.dataset.returnPage) {
                goBackFromSecondaryPage(inputPage);
                return;
            }
            navigateToMainPage('home');
        });
    }

    if (resultBackBtn) {
        resultBackBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openRelationshipAnalysisInput();
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            if (window.relationshipAnalysisState && window.relationshipAnalysisState.payload) {
                await submitRelationshipAnalysis(window.relationshipAnalysisState.payload);
            } else {
                openRelationshipAnalysisInput();
            }
        });
    }

    if (backToInputBtn) {
        backToInputBtn.addEventListener('click', () => {
            openRelationshipAnalysisInput();
        });
    }

    if (openChatBtn) {
        openChatBtn.addEventListener('click', () => {
            openRelationshipReplyInChat();
        });
    }

    if (returnToAnalysisBtn) {
        returnToAnalysisBtn.addEventListener('click', () => {
            const resultPage = document.getElementById('relationship-analysis-result-page');
            if (!resultPage) {
                return;
            }

            showPage('relationship-analysis-result');
            centerSubPageTitle(resultPage);
            resultPage.scrollTop = 0;
            const content = resultPage.querySelector('.page-content');
            if (content) {
                content.scrollTop = 0;
            }
        });
    }

    if (repliesList) {
        repliesList.addEventListener('click', (event) => {
            const trigger = event.target.closest('[data-relationship-reply]');
            if (!trigger) {
                return;
            }

            window.relationshipAnalysisState.selectedReply = trigger.dataset.relationshipReply || '';
            openRelationshipReplyInChat();
        });
    }

    if (fillExampleBtn) {
        fillExampleBtn.addEventListener('click', () => {
            populateRelationshipAnalysisForm({
                chatContext: `Me: Had fun talking with you yesterday.\nHer: Same, it was actually really nice.\nMe: We should continue this over coffee sometime.\nHer: Haha maybe, this week is a bit messy though.\nMe: No worries, next week works too.\nHer: Yeah maybe next week could be better.\nMe: Cool, let me know what day feels easiest for you.\nHer: I will, work has been a little chaotic lately.`,
                extraNotes: 'We matched about three weeks ago. The conversation used to feel warmer, but I am not sure whether she is still interested or just being polite now.',
                concern: 'should_i_push',
                customQuestion: 'I want to know whether I should keep nudging toward a date or stop pushing for now.',
                knownDuration: 'few_weeks',
                seenOffline: 'never',
                subjectiveStage: 'getting_closer',
                initiativeSide: 'user',
                currentGoal: 'light_invite',
                temperatureChange: 'slightly_cooler',
                hasInviteHistory: true,
                hasConflict: false
            });
        });
    }

    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', () => {
            populateRelationshipAnalysisForm({
                chatContext: '',
                extraNotes: '',
                concern: 'should_i_push',
                customQuestion: '',
                knownDuration: 'few_weeks',
                seenOffline: 'never',
                subjectiveStage: 'chatting_for_a_while',
                initiativeSide: 'user',
                currentGoal: 'light_invite',
                temperatureChange: 'stable',
                hasInviteHistory: false,
                hasConflict: false
            });
            clearScreenshotPreview();
        });
    }

    // Screenshot upload handlers
    console.log('[Screenshot] uploadBtn:', !!uploadBtn, 'screenshotInput:', !!screenshotInput);
    if (uploadBtn && screenshotInput) {
        uploadBtn.addEventListener('click', () => {
            console.log('[Screenshot] Upload button clicked');
            screenshotInput.value = '';
            screenshotInput.click();
        });

        screenshotInput.addEventListener('change', (event) => {
            if (event.target.files && event.target.files.length > 0) {
                processNewFiles(event.target.files);
            }
        });
    }

    async function processNewFiles(fileList) {
        const state = window.relationshipAnalysisState;
        const remaining = MAX_SCREENSHOTS - state.screenshots.length;
        const files = Array.from(fileList).slice(0, remaining);
        if (files.length === 0) return;

        // Create entries and render cards
        const newEntries = files.map(file => {
            const entry = {
                id: ++screenshotIdCounter,
                file,
                previewUrl: URL.createObjectURL(file),
                status: 'extracting',
                extractedText: ''
            };
            state.screenshots.push(entry);
            renderScreenshotCard(entry);
            return entry;
        });
        syncUploadBtnVisibility();

        // Sequential OCR to avoid API rate limiting
        for (const entry of newEntries) {
            try {
                const bs = window.backendService;
                if (!bs || typeof bs.extractTextFromImage !== 'function') {
                    throw new Error('Screenshot extraction service is not available.');
                }
                const result = await bs.extractTextFromImage(entry.file);
                entry.extractedText = result?.data?.extractedText || '';
                entry.status = 'done';
            } catch (error) {
                console.error('Screenshot text extraction failed:', error);
                entry.status = 'error';
            }
            updateOcrBadge(entry.id);
        }
        assembleTextareaFromScreenshots();
    }

    function renderScreenshotCard(screenshot) {
        if (!screenshotsStrip) return;
        const card = document.createElement('div');
        card.className = 'relationship-screenshot-preview';
        card.dataset.screenshotId = screenshot.id;
        card.innerHTML = `
            <img src="${screenshot.previewUrl}" alt="Screenshot preview">
            <button type="button" class="relationship-remove-screenshot" title="Remove">
                <i class="fas fa-times"></i>
            </button>
            <div class="relationship-ocr-status">
                <span class="ocr-spinner"></span> Extracting...
            </div>
        `;
        card.querySelector('.relationship-remove-screenshot').addEventListener('click', () => {
            removeScreenshot(screenshot.id);
        });
        screenshotsStrip.appendChild(card);
    }

    function updateOcrBadge(id) {
        const card = screenshotsStrip?.querySelector(`[data-screenshot-id="${id}"]`);
        if (!card) return;
        const badge = card.querySelector('.relationship-ocr-status');
        if (!badge) return;
        const entry = window.relationshipAnalysisState.screenshots.find(s => s.id === id);
        if (!entry) return;

        if (entry.status === 'done') {
            badge.innerHTML = '<i class="fas fa-check"></i> Done';
            badge.classList.add('success');
        } else if (entry.status === 'error') {
            badge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
            badge.classList.add('error');
        }
    }

    function removeScreenshot(id) {
        const state = window.relationshipAnalysisState;
        const idx = state.screenshots.findIndex(s => s.id === id);
        if (idx !== -1) {
            URL.revokeObjectURL(state.screenshots[idx].previewUrl);
            state.screenshots.splice(idx, 1);
        }
        const card = screenshotsStrip?.querySelector(`[data-screenshot-id="${id}"]`);
        if (card) card.remove();
        syncUploadBtnVisibility();
        assembleTextareaFromScreenshots();
    }

    function assembleTextareaFromScreenshots() {
        const state = window.relationshipAnalysisState;
        const chatContext = document.getElementById('relationship-chat-context');
        if (!chatContext) return;

        const doneScreenshots = state.screenshots.filter(s => s.status === 'done' && s.extractedText);
        if (doneScreenshots.length === 0) {
            chatContext.value = '';
            return;
        }
        if (doneScreenshots.length === 1) {
            chatContext.value = doneScreenshots[0].extractedText;
            return;
        }
        // Multiple screenshots — label and separate
        const parts = doneScreenshots.map((s, i) => `[Screenshot ${i + 1}]\n${s.extractedText}`);
        chatContext.value = parts.join('\n---\n');
    }

    function syncUploadBtnVisibility() {
        if (!uploadBtn) return;
        const count = window.relationshipAnalysisState.screenshots.length;
        uploadBtn.style.display = count >= MAX_SCREENSHOTS ? 'none' : '';
    }

    function clearScreenshotPreview() {
        const state = window.relationshipAnalysisState;
        if (state && state.screenshots) {
            state.screenshots.forEach(s => URL.revokeObjectURL(s.previewUrl));
            state.screenshots = [];
        }
        if (screenshotsStrip) screenshotsStrip.innerHTML = '';
        if (screenshotInput) screenshotInput.value = '';
        syncUploadBtnVisibility();
    }
}

function getRelationshipAnalysisPayloadFromForm() {
    const chatContext = document.getElementById('relationship-chat-context');
    const extraNotes = document.getElementById('relationship-extra-notes');
    const concern = document.getElementById('relationship-concern');
    const customQuestion = document.getElementById('relationship-custom-question');
    const knownDuration = document.getElementById('relationship-known-duration');
    const seenOffline = document.getElementById('relationship-seen-offline');
    const subjectiveStage = document.getElementById('relationship-subjective-stage');
    const initiativeSide = document.getElementById('relationship-initiative-side');
    const currentGoal = document.getElementById('relationship-current-goal');
    const temperatureChange = document.getElementById('relationship-temperature-change');
    const hasInviteHistory = document.getElementById('relationship-has-invite-history');
    const hasConflict = document.getElementById('relationship-has-conflict');

    const screenshotUsed = window.relationshipAnalysisState?.screenshots?.length > 0;

    return {
        chatContext: {
            sourceType: screenshotUsed ? 'screenshot' : 'pasted_text',
            rawText: chatContext ? chatContext.value.trim() : ''
        },
        concern: {
            type: concern ? concern.value : 'what_next',
            customNote: customQuestion ? customQuestion.value.trim() : ''
        },
        background: {
            knownDuration: knownDuration ? knownDuration.value : 'few_weeks',
            seenOffline: seenOffline ? seenOffline.value : 'never',
            subjectiveStage: subjectiveStage ? subjectiveStage.value : 'chatting_for_a_while',
            initiativeSide: initiativeSide ? initiativeSide.value : 'unclear',
            currentGoal: currentGoal ? currentGoal.value : 'test_interest',
            temperatureChange: temperatureChange ? temperatureChange.value : 'stable',
            hasInviteHistory: hasInviteHistory ? hasInviteHistory.checked : false,
            hasConflict: hasConflict ? hasConflict.checked : false
        },
        options: {
            responseLanguage: (window.I18nManager && window.I18nManager.getCurrentLanguage)
                ? window.I18nManager.getCurrentLanguage()
                : 'en-US',
            includeReplies: true
        },
        extraNotes: extraNotes ? extraNotes.value.trim() : ''
    };
}

function openRelationshipAnalysisExperience(prefill = {}) {
    const sourcePage = getCurrentActivePageId();
    if (window.relationshipAnalysisState) {
        window.relationshipAnalysisState.sourcePage = sourcePage;
    }
    populateRelationshipAnalysisForm(prefill);
    openSecondaryPage('relationship-analysis', sourcePage);
}

function populateRelationshipAnalysisForm(prefill = {}) {
    const mappings = [
        ['relationship-chat-context', prefill.chatContext || ''],
        ['relationship-extra-notes', prefill.extraNotes || ''],
        ['relationship-custom-question', prefill.customQuestion || ''],
        ['relationship-concern', prefill.concern || 'should_i_push'],
        ['relationship-known-duration', prefill.knownDuration || 'few_weeks'],
        ['relationship-seen-offline', prefill.seenOffline || 'never'],
        ['relationship-subjective-stage', prefill.subjectiveStage || 'chatting_for_a_while'],
        ['relationship-initiative-side', prefill.initiativeSide || 'user'],
        ['relationship-current-goal', prefill.currentGoal || 'light_invite'],
        ['relationship-temperature-change', prefill.temperatureChange || 'stable']
    ];

    mappings.forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && value !== undefined && value !== null) {
            element.value = value;
        }
    });

    const inviteHistory = document.getElementById('relationship-has-invite-history');
    if (inviteHistory) {
        inviteHistory.checked = !!prefill.hasInviteHistory;
    }

    const hasConflict = document.getElementById('relationship-has-conflict');
    if (hasConflict) {
        hasConflict.checked = !!prefill.hasConflict;
    }

    showRelationshipAnalysisError('');
}

async function submitRelationshipAnalysis(prebuiltPayload = null) {
    const payload = prebuiltPayload || getRelationshipAnalysisPayloadFromForm();
    const submitButton = document.querySelector('#relationship-analysis-form .relationship-primary-btn');
    const rawText = payload && payload.chatContext ? payload.chatContext.rawText : '';
    const inputPage = document.getElementById('relationship-analysis-page');
    const resultPage = document.getElementById('relationship-analysis-result-page');

    if (!rawText) {
        showRelationshipAnalysisError('Please paste the chat context before generating the relationship radar.');
        return;
    }

    showRelationshipAnalysisError('');

    try {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Analyzing...';
        }

        toggleRelationshipLoading(true);

        const aiService = window.aiService || null;
        let result;

        if (aiService && typeof aiService.analyzeRelationship === 'function') {
            result = await aiService.analyzeRelationship(payload);
        } else if (window.backendService && typeof window.backendService.analyzeRelationship === 'function') {
            const response = await window.backendService.analyzeRelationship(payload);
            result = response && response.data ? response.data : response;
        } else {
            throw new Error('Relationship analysis service is not available.');
        }

        window.relationshipAnalysisState.payload = payload;
        window.relationshipAnalysisState.result = result;
        window.relationshipAnalysisState.selectedReply = '';
        window.relationshipAnalysisState.sourcePage = inputPage && inputPage.dataset.returnPage
            ? inputPage.dataset.returnPage
            : (window.relationshipAnalysisState.sourcePage || 'home');

        if (resultPage) {
            resultPage.dataset.returnPage = 'relationship-analysis';
        }

        renderRelationshipAnalysisResult(result);
        openSecondaryPage('relationship-analysis-result', 'relationship-analysis');
    } catch (error) {
        console.error('Relationship analysis failed:', error);
        showRelationshipAnalysisError(error.message || 'Relationship analysis is temporarily unavailable.');
    } finally {
        toggleRelationshipLoading(false);
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Generate Relationship Radar';
        }
    }
}

function showRelationshipAnalysisError(message) {
    const errorEl = document.getElementById('relationship-analysis-error');
    if (!errorEl) {
        return;
    }

    if (!message) {
        errorEl.hidden = true;
        errorEl.textContent = '';
        return;
    }

    errorEl.textContent = message;
    errorEl.hidden = false;
}

function renderRelationshipAnalysisResult(result) {
    const safeResult = result || {};
    const stage = safeResult.stage || {};
    const initiative = safeResult.initiativeBalance || {};
    const pushWindow = safeResult.pushWindow || {};
    const nextBestAction = safeResult.nextBestAction || {};
    const currentPayload = window.relationshipAnalysisState
        ? window.relationshipAnalysisState.payload
        : null;

    renderRelationshipContextSummary(currentPayload);
    renderRelationshipConfidence(currentPayload);

    setRelationshipText('relationship-stage-label', stage.label || 'Need More Context');
    setRelationshipText('relationship-stage-reason', stage.reason || 'Add more context to improve the reliability of the current stage judgment.');
    renderStageEvidence(stage.evidence || '');
    setRelationshipText('relationship-summary-text', safeResult.summary || 'The result summary will explain the current rhythm, key signals, and the clearest next move.');
    setRelationshipText('relationship-initiative-label', initiative.label || 'Unclear');
    setRelationshipText('relationship-initiative-reason', initiative.reason || 'We need a bit more continuous interaction to judge who is carrying the rhythm.');
    setRelationshipText('relationship-push-label', pushWindow.label || 'Hold');
    setRelationshipText('relationship-push-reason', pushWindow.reason || 'The push window will explain whether now is a good time to move forward.');
    setRelationshipText('relationship-next-action-label', nextBestAction.label || 'Gather More Context');
    setRelationshipText('relationship-next-action-reason', nextBestAction.reason || 'The system will point to the strongest current move once enough context is available.');
    setRelationshipText('relationship-next-action-tip', nextBestAction.tip || 'Keep the move light and grounded in the real situation.');
    updateRelationshipActionButton(nextBestAction.label || '', safeResult.suggestedReplies || []);

    renderRelationshipList('relationship-positive-signals', safeResult.positiveSignals, [
        'Positive signals will appear here once the analysis sees enough steady interest.'
    ]);
    renderRelationshipList('relationship-risk-signals', safeResult.riskSignals, [
        'Risk signals will appear here when the analysis detects friction or over-pushing.'
    ]);
    renderRelationshipList('relationship-avoid-actions', safeResult.avoidActions, [
        'Avoid rushing the next step until the current rhythm is clearer.'
    ]);

    renderRelationshipReplies(safeResult.suggestedReplies || []);
}

function renderRelationshipConfidence(payload) {
    const reading = getRelationshipConfidenceReading(payload);
    setRelationshipText('relationship-confidence-label', reading.label);
    setRelationshipText('relationship-confidence-reason', reading.reason);
    setRelationshipText('relationship-improve-title', reading.followUpTitle);
    renderRelationshipList('relationship-improve-list', reading.followUpItems, [
        'Bring one recent turning point so the next read has stronger evidence.'
    ]);
}

function renderRelationshipContextSummary(payload) {
    const safePayload = payload || {};
    const concern = safePayload.concern || {};
    const background = safePayload.background || {};
    const rawText = safePayload.chatContext && safePayload.chatContext.rawText
        ? safePayload.chatContext.rawText.trim()
        : '';
    const customQuestion = concern.customNote || '';
    const concernLabel = getRelationshipConcernLabel(concern.type);
    const questionText = customQuestion || concernLabel;
    const chips = [
        getRelationshipGoalLabel(background.currentGoal),
        getRelationshipDurationLabel(background.knownDuration),
        getRelationshipOfflineLabel(background.seenOffline),
        getRelationshipInitiativeLabel(background.initiativeSide),
        getRelationshipTemperatureLabel(background.temperatureChange),
        background.hasInviteHistory ? 'History: Invite already happened' : '',
        background.hasConflict ? 'Recent friction: Yes' : ''
    ].filter(Boolean);

    setRelationshipText(
        'relationship-context-question',
        questionText
            ? `Primary question: ${questionText}`
            : 'This analysis is based on the chat context and background details you provided.'
    );
    renderRelationshipContextChips(chips);
    setRelationshipText(
        'relationship-context-snippet',
        rawText
            ? getRelationshipSnippet(rawText)
            : 'Add more recent chat context next time if you want a stronger stage judgment.'
    );
}

function renderRelationshipContextChips(chips) {
    const container = document.getElementById('relationship-context-chips');
    if (!container) {
        return;
    }

    const finalChips = Array.isArray(chips) && chips.length ? chips : ['Context summary unavailable'];
    container.innerHTML = finalChips
        .map((chip) => `<span class="relationship-context-chip">${escapeRelationshipHtml(chip)}</span>`)
        .join('');
}

function getRelationshipConfidenceReading(payload) {
    const safePayload = payload || {};
    const rawText = safePayload.chatContext && safePayload.chatContext.rawText
        ? safePayload.chatContext.rawText.trim()
        : '';
    const background = safePayload.background || {};
    const customQuestion = safePayload.concern && safePayload.concern.customNote
        ? safePayload.concern.customNote.trim()
        : '';
    let score = 0;

    if (rawText.length >= 500) {
        score += 3;
    } else if (rawText.length >= 220) {
        score += 2;
    } else if (rawText.length >= 80) {
        score += 1;
    }

    if (customQuestion) {
        score += 1;
    }

    if (safePayload.extraNotes) {
        score += 1;
    }

    if (background.knownDuration && background.knownDuration !== 'few_weeks') {
        score += 1;
    }

    if (background.initiativeSide && background.initiativeSide !== 'unclear') {
        score += 1;
    }

    if (background.temperatureChange && background.temperatureChange !== 'unclear') {
        score += 1;
    }

    if (background.hasInviteHistory) {
        score += 1;
    }

    if (background.hasConflict) {
        score += 1;
    }

    if (score >= 8) {
        return {
            label: 'Grounded',
            reason: 'You provided enough recent context and background detail for the radar to make a stronger stage read. It is still guidance, but it is based on real signals instead of guesswork.',
            followUpTitle: 'This read is stronger because you already gave enough signal.',
            followUpItems: [
                'You included a recent exchange with enough detail to show the rhythm clearly.',
                'Your background notes helped explain whether the situation is warming up, cooling down, or staying steady.',
                'If the situation changes, add the newest turning point rather than pasting everything again.'
            ]
        };
    }

    if (score >= 5) {
        return {
            label: 'Moderate',
            reason: 'There is enough context here to point to a likely direction, but the read would get stronger with a slightly longer recent exchange or one clearer turning point.',
            followUpTitle: 'You can make the next read stronger with one or two sharper signals.',
            followUpItems: [
                'Add the exact part where the rhythm changed, not just the general summary.',
                'Include whether there was a real invite, hesitation, or change in initiative.',
                'If one message felt important, paste that moment and the few lines around it.'
            ]
        };
    }

    return {
        label: 'Early Read',
        reason: 'This looks more like an early directional read than a strong judgment. Add a longer recent exchange, a clearer shift in rhythm, or one concrete event to improve reliability.',
        followUpTitle: 'This is still an early read. Add more concrete evidence next time.',
        followUpItems: [
            'Paste a longer recent exchange so the system can see both sides of the rhythm.',
            'Mention one specific event, such as an invite, a missed chance, or a sudden cool-down.',
            'Tell the system what decision you are trying to make right now so the output stays focused.'
        ]
    };
}

function renderRelationshipList(elementId, items, fallbackItems) {
    const list = document.getElementById(elementId);
    if (!list) {
        return;
    }

    const finalItems = Array.isArray(items) && items.length ? items : fallbackItems;
    list.innerHTML = finalItems.map((item) => {
        // 兼容新格式（对象 {text, evidence}）和旧格式（纯字符串）
        if (typeof item === 'object' && item !== null && item.text) {
            const text = escapeRelationshipHtml(item.text);
            const evidence = item.evidence ? escapeRelationshipHtml(item.evidence) : '';
            if (evidence) {
                return `<li>${text}<span class="relationship-evidence">"${evidence}"</span></li>`;
            }
            return `<li>${text}</li>`;
        }
        return `<li>${escapeRelationshipHtml(item)}</li>`;
    }).join('');
}

function renderStageEvidence(evidence) {
    const el = document.getElementById('relationship-stage-evidence');
    if (!el) return;
    if (evidence) {
        el.textContent = `"${evidence}"`;
        el.hidden = false;
    } else {
        el.hidden = true;
    }
}

function renderRelationshipReplies(replies) {
    const container = document.getElementById('relationship-replies-list');
    const openChatButton = document.getElementById('relationship-open-chat-btn');
    if (!container) {
        return;
    }

    const finalReplies = Array.isArray(replies) && replies.length ? replies : [{
        style: 'Steady',
        content: 'I need a bit more chat context before recommending a stronger move.',
        reason: 'Once the context is clearer, the suggestion will be much more reliable.'
    }];

    container.innerHTML = finalReplies.map((reply) => `
        <article class="relationship-reply-card">
            <strong>${escapeRelationshipHtml(reply.style || 'Suggested')}</strong>
            <p>${escapeRelationshipHtml(reply.content || '')}</p>
            <small>${escapeRelationshipHtml(reply.reason || '')}</small>
            <div class="relationship-reply-actions">
                <button type="button" class="relationship-reply-btn" data-relationship-reply="${escapeRelationshipAttribute(reply.content || '')}">
                    Use In Chat
                </button>
            </div>
        </article>
    `).join('');

    if (window.relationshipAnalysisState && !window.relationshipAnalysisState.selectedReply) {
        window.relationshipAnalysisState.selectedReply = finalReplies[0].content || '';
    }

    if (openChatButton) {
        const label = getRelationshipActionButtonLabel(
            window.relationshipAnalysisState && window.relationshipAnalysisState.result
                ? window.relationshipAnalysisState.result.nextBestAction?.label || ''
                : '',
            finalReplies
        );
        openChatButton.textContent = label;
    }
}

function toggleRelationshipLoading(isLoading) {
    const loadingCard = document.getElementById('relationship-loading-card');
    if (!loadingCard) {
        return;
    }

    loadingCard.hidden = !isLoading;

    if (isLoading) {
        // Reset steps
        loadingCard.querySelectorAll('.loading-step').forEach(el => {
            el.classList.toggle('active', parseInt(el.dataset.step) === 1);
        });
        let step = 1;
        window._relationshipLoadingInterval = setInterval(() => {
            step = step >= 3 ? 1 : step + 1;
            loadingCard.querySelectorAll('.loading-step').forEach(el => {
                el.classList.toggle('active', parseInt(el.dataset.step) <= step);
            });
        }, 2500);
    } else {
        clearInterval(window._relationshipLoadingInterval);
    }
}

function buildRelationshipChatContext(result) {
    if (!result) return '';
    const stage = result.stage || {};
    const push = result.pushWindow || {};
    const next = result.nextBestAction || {};
    const initiative = result.initiativeBalance || {};
    const formatSignals = (signals) => (signals || []).map(s =>
        typeof s === 'object' && s.text ? s.text : s
    ).join('；');
    const positives = formatSignals(result.positiveSignals);
    const risks = formatSignals(result.riskSignals);
    const avoids = (result.avoidActions || []).join('；');
    return [
        '【关系分析上下文 — 请基于以下判断回答用户的追问】',
        `当前阶段: ${stage.label || '未知'}（${stage.reason || ''}）`,
        `局势摘要: ${result.summary || ''}`,
        `兴趣信号: ${positives || '无'}`,
        `风险信号: ${risks || '无'}`,
        `主动度: ${initiative.label || ''}（${initiative.reason || ''}）`,
        `推进窗口: ${push.label || ''}（${push.reason || ''}）`,
        `建议动作: ${next.label || ''}（${next.reason || ''}）`,
        `避免动作: ${avoids || '无'}`,
        '请在回答时保持与以上判断一致，不要推翻已有结论，除非用户提供了新的关键信息。'
    ].join('\n');
}

function buildAnalysisGreeting(result) {
    if (!result) return '分析结果已加载，你可以问我任何关于这段关系的问题。';
    const stage = result.stage || {};
    const push = result.pushWindow || {};
    const next = result.nextBestAction || {};
    const parts = [`根据刚才的分析，你们目前处于「${stage.label || '待判断'}」阶段。`];
    if (push.label) parts.push(`推进窗口：${push.label}。`);
    if (next.label) parts.push(`建议下一步：${next.label}。`);
    parts.push('');
    parts.push('你可以继续问我，比如：');
    parts.push('• 对方某句话到底什么意思？');
    parts.push('• 我现在应该怎么回复？');
    parts.push('• 这个时机适合约出来吗？');
    return parts.join('\n');
}

function openRelationshipReplyInChat() {
    const state = window.relationshipAnalysisState || {};
    const result = state.result || {};
    const replies = Array.isArray(result.suggestedReplies) ? result.suggestedReplies : [];
    const fallbackReply = replies.length ? replies[0].content : '';
    const nextReply = state.selectedReply || fallbackReply || '';
    const stageLabel = result.stage && result.stage.label
        ? result.stage.label
        : 'Relationship Analysis';

    window.chatReturnContext = {
        kind: 'relationship-analysis',
        pageId: 'relationship-analysis-result',
        title: `Return to ${stageLabel}`,
        analysisResult: result,
        analysisPayload: state.payload || null
    };

    if (typeof showPage === 'function') {
        showPage('chat');
    }
    if (typeof updateNavigation === 'function') {
        updateNavigation('chat');
    }

    // 创建专属会话 + AI 自动开场白
    window.setTimeout(() => {
        const sessionName = `关系分析 · ${stageLabel}`;
        let sessionId = null;
        if (window.createSessionWithName) {
            sessionId = window.createSessionWithName(sessionName, '关系分析', true);
        }

        // 将分析上下文绑定到会话（持久化，不依赖 window 变量）
        if (sessionId && window.chatSessionManager) {
            if (!window.chatSessionManager.sessionMeta) {
                window.chatSessionManager.sessionMeta = {};
            }
            window.chatSessionManager.sessionMeta[sessionId] = {
                kind: 'relationship-analysis',
                analysisResult: result,
                analysisPayload: state.payload || null
            };
        }

        // AI 自动发送开场白
        const greeting = buildAnalysisGreeting(result);
        if (sessionId && window.chatSessionManager) {
            window.chatSessionManager.addMessage(sessionId, 'ai', greeting);
            window.chatSessionManager.addMessageToUI('ai', greeting);
        }

        // 预填建议话术到输入框
        const chatInput = document.querySelector('.chat-input-field');
        if (chatInput && nextReply) {
            chatInput.value = nextReply;
            chatInput.focus();
        }
    }, 200);
}

function openRelationshipAnalysisInput() {
    const inputPage = document.getElementById('relationship-analysis-page');
    const state = window.relationshipAnalysisState || {};
    const sourcePage = state.sourcePage
        || (inputPage && inputPage.dataset.returnPage)
        || 'home';

    if (inputPage) {
        inputPage.dataset.returnPage = sourcePage;
    }

    showPage('relationship-analysis');
    if (inputPage) {
        centerSubPageTitle(inputPage);
        inputPage.scrollTop = 0;
        const content = inputPage.querySelector('.page-content');
        if (content) {
            content.scrollTop = 0;
        }
    }
}

function goBackFromRelationshipAnalysisInput() {
    const inputPage = document.getElementById('relationship-analysis-page');
    if (inputPage && inputPage.dataset.returnPage) {
        goBackFromSecondaryPage(inputPage);
        return;
    }

    navigateToMainPage('home');
}

function goBackFromRelationshipAnalysisResult() {
    openRelationshipAnalysisInput();
}

// --- Relationship Analysis History ---

async function openRelationshipHistory() {
    showPage('relationship-history');
    const list = document.getElementById('relationship-history-list');
    if (!list) return;
    list.innerHTML = '<p class="relationship-history-empty">Loading...</p>';

    try {
        const bs = window.backendService;
        if (!bs || typeof bs.getRelationshipHistory !== 'function') {
            list.innerHTML = '<p class="relationship-history-empty">History requires a signed-in account.</p>';
            return;
        }
        const res = await bs.getRelationshipHistory(20, 0);
        const records = res && res.data ? res.data.records : (res && res.records ? res.records : []);
        if (!records || !records.length) {
            list.innerHTML = '<p class="relationship-history-empty">No past analyses yet.</p>';
            return;
        }
        list.innerHTML = records.map(r => {
            const date = new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const stage = escapeRelationshipHtml(r.stage_label || 'Analysis');
            return `<button type="button" class="relationship-history-item" data-history-id="${r.id}">
                <strong>${stage}</strong>
                <span>${date}</span>
            </button>`;
        }).join('');

        list.querySelectorAll('.relationship-history-item').forEach(btn => {
            btn.addEventListener('click', () => loadRelationshipHistoryDetail(btn.dataset.historyId));
        });
    } catch (e) {
        console.error('Failed to load relationship history:', e);
        list.innerHTML = '<p class="relationship-history-empty">Failed to load history.</p>';
    }
}

async function loadRelationshipHistoryDetail(id) {
    try {
        const bs = window.backendService;
        if (!bs) return;
        const res = await bs.getRelationshipDetail(id);
        const record = res && res.data ? res.data : res;
        if (!record || !record.result) return;

        window.relationshipAnalysisState.payload = record.payload || null;
        window.relationshipAnalysisState.result = record.result;
        window.relationshipAnalysisState.selectedReply = '';

        renderRelationshipAnalysisResult(record.result);
        openSecondaryPage('relationship-analysis-result', 'relationship-history');
    } catch (e) {
        console.error('Failed to load analysis detail:', e);
    }
}

function goBackFromRelationshipHistory() {
    openRelationshipAnalysisInput();
}

window.openRelationshipHistory = openRelationshipHistory;
window.goBackFromRelationshipHistory = goBackFromRelationshipHistory;

function syncChatReturnBanner(pageId) {
    const banner = document.getElementById('chat-return-banner');
    const title = document.getElementById('chat-return-title');
    const context = window.chatReturnContext || null;

    if (!banner) {
        return;
    }

    const currentPage = pageId || getCurrentActivePageId();
    const shouldShow = currentPage === 'chat' && context && context.kind === 'relationship-analysis';

    banner.hidden = !shouldShow;
    if (shouldShow && title) {
        title.textContent = context.title || 'You came from relationship analysis.';
    }
}

window.handlePageShown = function handlePageShown(pageId) {
    if (!['chat', 'relationship-analysis', 'relationship-analysis-result'].includes(pageId)) {
        window.chatReturnContext = null;
    }

    syncChatReturnBanner(pageId);
};
window.goBackFromRelationshipAnalysisInput = goBackFromRelationshipAnalysisInput;
window.goBackFromRelationshipAnalysisResult = goBackFromRelationshipAnalysisResult;

function setRelationshipText(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function escapeRelationshipHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeRelationshipAttribute(value) {
    return escapeRelationshipHtml(value).replace(/`/g, '&#96;');
}

function getRelationshipConcernLabel(value) {
    const labels = {
        should_i_push: 'Should I push the relationship forward now?',
        interest_level: 'How interested does she seem right now?',
        what_next: 'What should I do next?',
        am_i_too_fast: 'Am I moving too fast?',
        why_cold_down: 'Why did things cool down?',
        how_to_reply: 'What should I reply with?'
    };

    return labels[value] || '';
}

function getRelationshipGoalLabel(value) {
    const labels = {
        test_interest: 'Goal: Test interest',
        light_invite: 'Goal: Try a light invite',
        build_flirt: 'Goal: Build flirt',
        keep_chatting: 'Goal: Keep chatting naturally',
        repair_rhythm: 'Goal: Repair the rhythm'
    };

    return labels[value] || '';
}

function getRelationshipDurationLabel(value) {
    const labels = {
        within_week: 'Known each other: Within a week',
        few_weeks: 'Known each other: A few weeks',
        over_month: 'Known each other: Over a month',
        longer: 'Known each other: Much longer'
    };

    return labels[value] || '';
}

function getRelationshipOfflineLabel(value) {
    const labels = {
        never: 'Offline: Not yet',
        once: 'Offline: Met once',
        several_times: 'Offline: Met several times'
    };

    return labels[value] || '';
}

function getRelationshipInitiativeLabel(value) {
    const labels = {
        user: 'Initiative: Mostly you',
        balanced: 'Initiative: About equal',
        target: 'Initiative: Mostly her',
        unclear: 'Initiative: Hard to tell'
    };

    return labels[value] || '';
}

function getRelationshipTemperatureLabel(value) {
    const labels = {
        stable: 'Temperature: Stable',
        warmer: 'Temperature: Getting warmer',
        slightly_cooler: 'Temperature: Slightly cooler',
        much_cooler: 'Temperature: Much cooler',
        unclear: 'Temperature: Unclear'
    };

    return labels[value] || '';
}

function getRelationshipSnippet(text) {
    const normalized = String(text).replace(/\s+/g, ' ').trim();
    if (!normalized) {
        return '';
    }

    if (normalized.length <= 220) {
        return normalized;
    }

    return `${normalized.slice(0, 217)}...`;
}

function updateRelationshipActionButton(nextActionLabel, replies) {
    const openChatButton = document.getElementById('relationship-open-chat-btn');
    if (!openChatButton) {
        return;
    }

    openChatButton.textContent = getRelationshipActionButtonLabel(nextActionLabel, replies);
}

function getRelationshipActionButtonLabel(nextActionLabel, replies) {
    const label = String(nextActionLabel || '').toLowerCase();
    const hasReplies = Array.isArray(replies) && replies.length > 0;

    if (!hasReplies) {
        return 'Open Chat';
    }

    if (label.includes('invite')) {
        return 'Open Chat With Invite Draft';
    }

    if (label.includes('repair')) {
        return 'Open Chat With Repair Draft';
    }

    if (label.includes('flirt')) {
        return 'Open Chat With Flirty Draft';
    }

    if (label.includes('chat')) {
        return 'Open Chat With Suggested Reply';
    }

    return 'Open Chat With Top Suggestion';
}

window.openSecondaryPage = openSecondaryPage;
window.openRelationshipAnalysisExperience = openRelationshipAnalysisExperience;

