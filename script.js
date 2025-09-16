/**
 * Professional SEO Content Analyzer
 * Based on Google 2024-2025 algorithm insights and professional SEO tool methodologies
 */

class SEOContentAnalyzer {
    constructor() {
        this.content = '';
        this.targetKeyword = '';
        this.metaDescription = '';
        this.analysisResults = {};
        this.isInitialLoad = true;

        this.initializeEventListeners();
        this.updateAnalysis();
        this.isInitialLoad = false;
    }

    initializeEventListeners() {
        const contentInput = document.getElementById('content-input');
        const targetKeyword = document.getElementById('target-keyword');
        const metaDescription = document.getElementById('meta-description');

        // Real-time analysis with debouncing
        contentInput.addEventListener('input', this.debounce(() => {
            this.content = contentInput.value;
            this.updateAnalysis();
        }, 300));

        targetKeyword.addEventListener('input', this.debounce(() => {
            this.targetKeyword = targetKeyword.value;
            this.updateAnalysis();
        }, 300));

        metaDescription.addEventListener('input', this.debounce(() => {
            this.metaDescription = metaDescription.value;
            this.updateMetaAnalysis();
        }, 300));

        // Export functionality
        document.getElementById('export-json').addEventListener('click', () => this.exportJSON());
        document.getElementById('export-csv').addEventListener('click', () => this.exportCSV());
        document.getElementById('clear-content').addEventListener('click', () => this.clearContent());
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    updateAnalysis() {
        if (!this.content.trim()) {
            this.resetAnalysis();
            return;
        }

        // Perform all analyses
        const wordStats = this.calculateWordStats();
        const readabilityScores = this.calculateReadabilityScores();
        const keywordAnalysis = this.analyzeKeywords();
        const headingStructure = this.analyzeHeadingStructure();
        const seoScore = this.calculateSEOScore(wordStats, readabilityScores, keywordAnalysis, headingStructure);

        // Store results
        this.analysisResults = {
            wordStats,
            readabilityScores,
            keywordAnalysis,
            headingStructure,
            seoScore,
            timestamp: new Date().toISOString()
        };

        // Update UI
        this.updateWordStatsUI(wordStats);
        this.updateReadabilityUI(readabilityScores);
        this.updateKeywordAnalysisUI(keywordAnalysis);
        this.updateHeadingStructureUI(headingStructure);
        this.updateSEOScoreUI(seoScore);
    }

    calculateWordStats() {
        const text = this.content.trim();
        if (!text) return { words: 0, characters: 0, sentences: 0, paragraphs: 0, readingTime: 0 };

        // Word count (excluding extra whitespace)
        const words = text.split(/\s+/).filter(word => word.length > 0).length;

        // Character count (including spaces)
        const characters = text.length;

        // Sentence count (improved regex for better accuracy)
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;

        // Paragraph count
        const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;

        // Reading time calculation (238 WPM baseline as per research)
        const readingTime = Math.round((words / 238) * 1.1 * 10) / 10; // 1.1 factor for scanning behavior

        return { words, characters, sentences, paragraphs, readingTime };
    }

    calculateReadabilityScores() {
        const { words, sentences } = this.calculateWordStats();

        if (words === 0 || sentences === 0) {
            return {
                fleschEase: 0,
                fleschKincaid: 0,
                smogIndex: 0,
                fleschEaseGrade: 'N/A',
                fleschKincaidGrade: 'N/A',
                smogGrade: 'N/A'
            };
        }

        const syllables = this.countSyllables();
        const polysyllabicWords = this.countPolysyllabicWords();

        // Flesch Reading Ease: 206.835 - (1.015 × words/sentences) - (84.6 × syllables/words)
        const fleschEase = Math.max(0, Math.min(100,
            206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
        ));

        // Flesch-Kincaid Grade Level: 0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59
        const fleschKincaid = Math.max(0,
            0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
        );

        // SMOG Index: 1.043 × √(polysyllabic words × 30/sentences) + 3.1291
        const smogIndex = sentences >= 30 ?
            1.043 * Math.sqrt((polysyllabicWords * 30) / sentences) + 3.1291 :
            Math.max(0, 1.043 * Math.sqrt(polysyllabicWords) + 3.1291);

        return {
            fleschEase: Math.round(fleschEase * 10) / 10,
            fleschKincaid: Math.round(fleschKincaid * 10) / 10,
            smogIndex: Math.round(smogIndex * 10) / 10,
            fleschEaseGrade: this.getFleschEaseGrade(fleschEase),
            fleschKincaidGrade: this.getGradeDescription(fleschKincaid),
            smogGrade: this.getGradeDescription(smogIndex)
        };
    }

    countSyllables() {
        const words = this.content.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        let syllableCount = 0;

        words.forEach(word => {
            // Remove punctuation
            word = word.replace(/[^a-z]/g, '');
            if (word.length === 0) return;

            // Count vowel groups
            let syllables = (word.match(/[aeiouy]+/g) || []).length;

            // Subtract silent 'e' at the end
            if (word.endsWith('e')) syllables--;

            // Every word has at least one syllable
            syllables = Math.max(1, syllables);
            syllableCount += syllables;
        });

        return syllableCount;
    }

    countPolysyllabicWords() {
        const words = this.content.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        let polysyllabicCount = 0;

        words.forEach(word => {
            word = word.replace(/[^a-z]/g, '');
            if (word.length === 0) return;

            let syllables = (word.match(/[aeiouy]+/g) || []).length;
            if (word.endsWith('e')) syllables--;
            syllables = Math.max(1, syllables);

            if (syllables >= 3) polysyllabicCount++;
        });

        return polysyllabicCount;
    }

    getFleschEaseGrade(score) {
        if (score >= 90) return 'Very Easy (5th grade)';
        if (score >= 80) return 'Easy (6th grade)';
        if (score >= 70) return 'Fairly Easy (7th grade)';
        if (score >= 60) return 'Standard (8th-9th grade)';
        if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
        if (score >= 30) return 'Difficult (College)';
        return 'Very Difficult (Graduate)';
    }

    getGradeDescription(grade) {
        const gradeLevel = Math.round(grade);
        if (gradeLevel <= 6) return `${gradeLevel}th grade`;
        if (gradeLevel <= 12) return `${gradeLevel}th grade`;
        if (gradeLevel <= 16) return `College level (${gradeLevel-12} years)`;
        return 'Graduate level';
    }

    analyzeKeywords() {
        if (!this.content.trim()) {
            return {
                primaryKeywordDensity: 0,
                primaryKeywordCount: 0,
                optimalRange: '1-2%',
                status: 'No content to analyze',
                topKeywords: [],
                semanticKeywords: []
            };
        }

        const words = this.content.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        const totalWords = words.length;

        // Primary keyword analysis
        let primaryKeywordCount = 0;
        let primaryKeywordDensity = 0;
        let status = 'Enter target keyword for analysis';

        if (this.targetKeyword.trim()) {
            const keyword = this.targetKeyword.toLowerCase().trim();
            const keywordWords = keyword.split(/\s+/);

            if (keywordWords.length === 1) {
                // Single word keyword
                primaryKeywordCount = words.filter(word =>
                    word.replace(/[^a-z0-9]/g, '') === keyword.replace(/[^a-z0-9]/g, '')
                ).length;
            } else {
                // Multi-word keyword phrase
                const text = this.content.toLowerCase();
                const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                primaryKeywordCount = (text.match(regex) || []).length;
            }

            primaryKeywordDensity = totalWords > 0 ? (primaryKeywordCount / totalWords) * 100 : 0;

            // Status based on density (0.5-2% optimal per research)
            if (primaryKeywordDensity === 0) {
                status = 'Keyword not found in content';
            } else if (primaryKeywordDensity < 0.5) {
                status = 'Keyword density too low';
            } else if (primaryKeywordDensity <= 2) {
                status = 'Optimal keyword density';
            } else if (primaryKeywordDensity <= 3) {
                status = 'Keyword density slightly high';
            } else {
                status = 'Keyword density too high - risk of over-optimization';
            }
        }

        // Top keywords extraction
        const topKeywords = this.extractTopKeywords(words);

        return {
            primaryKeywordDensity: Math.round(primaryKeywordDensity * 100) / 100,
            primaryKeywordCount,
            optimalRange: '0.5-2%',
            status,
            topKeywords,
            semanticKeywords: this.extractSemanticKeywords(words)
        };
    }

    extractTopKeywords(words) {
        // Remove common stop words
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs', 'what', 'where', 'when', 'why', 'how', 'which', 'who', 'whom', 'whose', 'if', 'unless', 'until', 'while', 'although', 'though', 'because', 'since', 'so', 'than', 'as', 'like', 'about', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
        ]);

        const wordCounts = {};
        words.forEach(word => {
            const cleanWord = word.replace(/[^a-z0-9]/gi, '').toLowerCase();
            if (cleanWord.length >= 3 && !stopWords.has(cleanWord) && !/^\d+$/.test(cleanWord)) {
                wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
            }
        });

        return Object.entries(wordCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ word, count, density: Math.round((count / words.length) * 10000) / 100 }));
    }

    extractSemanticKeywords(words) {
        // Simple semantic analysis - look for related terms
        // In a real implementation, this would use NLP libraries or APIs
        const semanticTerms = [];
        const text = this.content.toLowerCase();

        // Basic semantic patterns based on target keyword
        if (this.targetKeyword.trim()) {
            const keyword = this.targetKeyword.toLowerCase();

            // Look for variations and related terms
            const patterns = [
                keyword + 's',
                keyword + 'ed',
                keyword + 'ing',
                keyword + 'er',
                keyword + 'est',
                'best ' + keyword,
                keyword + ' guide',
                keyword + ' tips',
                'how to ' + keyword
            ];

            patterns.forEach(pattern => {
                if (text.includes(pattern) && pattern !== keyword) {
                    semanticTerms.push(pattern);
                }
            });
        }

        return semanticTerms.slice(0, 5);
    }

    analyzeHeadingStructure() {
        // Extract headings from content using markdown-style patterns and HTML
        const headingMatches = [
            ...Array.from(this.content.matchAll(/^#{1,6}\s+(.+)$/gm)),
            ...Array.from(this.content.matchAll(/<h([1-6])(?:[^>]*)>([^<]+)<\/h[1-6]>/gi))
        ];

        const headings = [];
        const headingCounts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };

        headingMatches.forEach(match => {
            let level, text;

            if (match[0].startsWith('#')) {
                // Markdown style
                level = match[0].match(/^#+/)[0].length;
                text = match[1].trim();
            } else {
                // HTML style
                level = parseInt(match[1]);
                text = match[2].trim();
            }

            headings.push({ level, text: text.substring(0, 100) });
            headingCounts[`h${level}`]++;
        });

        const totalHeadings = headings.length;
        const hasH1 = headingCounts.h1 > 0;
        const multipleH1 = headingCounts.h1 > 1;

        // Analyze structure quality
        let structureScore = 100;
        const issues = [];

        if (!hasH1) {
            structureScore -= 30;
            issues.push('Missing H1 tag');
        }

        if (multipleH1) {
            structureScore -= 20;
            issues.push('Multiple H1 tags found');
        }

        // Check for logical hierarchy
        let previousLevel = 0;
        let hierarchyIssues = 0;
        headings.forEach(heading => {
            if (heading.level > previousLevel + 1) {
                hierarchyIssues++;
            }
            previousLevel = heading.level;
        });

        if (hierarchyIssues > 0) {
            structureScore -= hierarchyIssues * 10;
            issues.push('Heading hierarchy issues detected');
        }

        return {
            totalHeadings,
            headings,
            headingCounts,
            hasH1,
            multipleH1,
            structureScore: Math.max(0, structureScore),
            issues
        };
    }

    calculateSEOScore(wordStats, readabilityScores, keywordAnalysis, headingStructure) {
        let contentQualityScore = 0;
        let technicalSEOScore = 0;
        let readabilityScore = 0;

        // Content Quality Score (40% weight)
        // Word count optimization (1,500-2,500 optimal for blog posts)
        if (wordStats.words >= 1500 && wordStats.words <= 2500) {
            contentQualityScore += 30;
        } else if (wordStats.words >= 1000 && wordStats.words <= 3000) {
            contentQualityScore += 20;
        } else if (wordStats.words >= 500) {
            contentQualityScore += 10;
        }

        // Keyword optimization
        if (keywordAnalysis.primaryKeywordDensity >= 0.5 && keywordAnalysis.primaryKeywordDensity <= 2) {
            contentQualityScore += 30;
        } else if (keywordAnalysis.primaryKeywordDensity > 0) {
            contentQualityScore += 15;
        }

        // Content structure
        if (wordStats.sentences > 0) {
            const avgWordsPerSentence = wordStats.words / wordStats.sentences;
            if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
                contentQualityScore += 25;
            } else if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) {
                contentQualityScore += 15;
            } else {
                contentQualityScore += 5;
            }
        }

        // Semantic keyword presence
        if (keywordAnalysis.semanticKeywords.length > 0) {
            contentQualityScore += 15;
        }

        contentQualityScore = Math.min(100, contentQualityScore);

        // Technical SEO Score (30% weight)
        technicalSEOScore = headingStructure.structureScore;

        // Readability Score (30% weight)
        // Target 7th-8th grade level for general content
        if (readabilityScores.fleschKincaid >= 7 && readabilityScores.fleschKincaid <= 8) {
            readabilityScore = 100;
        } else if (readabilityScores.fleschKincaid >= 6 && readabilityScores.fleschKincaid <= 9) {
            readabilityScore = 85;
        } else if (readabilityScores.fleschKincaid >= 5 && readabilityScores.fleschKincaid <= 12) {
            readabilityScore = 70;
        } else {
            readabilityScore = 50;
        }

        // Overall score calculation
        const overallScore = Math.round(
            (contentQualityScore * 0.4) +
            (technicalSEOScore * 0.3) +
            (readabilityScore * 0.3)
        );

        return {
            overall: overallScore,
            contentQuality: Math.round(contentQualityScore),
            technicalSEO: Math.round(technicalSEOScore),
            readability: Math.round(readabilityScore)
        };
    }

    updateMetaAnalysis() {
        const metaText = this.metaDescription;
        const charCount = metaText.length;

        // Update character count display
        document.getElementById('meta-character-count').textContent = charCount;

        // Update length status
        const lengthStatus = document.getElementById('meta-length-status');
        if (charCount === 0) {
            lengthStatus.textContent = 'Ready to write!';
        } else if (charCount < 120) {
            lengthStatus.textContent = `${120 - charCount} chars to go`;
        } else if (charCount <= 158) {
            lengthStatus.textContent = 'Perfect length!';
        } else {
            lengthStatus.textContent = `${charCount - 158} chars too long`;
        }

        // Update progress bar
        const maxChars = 158;
        const fillPercentage = Math.min(100, (charCount / maxChars) * 100);
        document.getElementById('meta-length-fill').style.width = `${fillPercentage}%`;

        // Update status with helpful guidance
        const statusElement = document.getElementById('meta-status');
        const statusIcon = statusElement.querySelector('.status-icon');
        const statusText = statusElement.querySelector('span:last-child');

        if (charCount === 0) {
            statusIcon.textContent = '✍️';
            statusText.textContent = 'Write a compelling description to get more clicks from Google';
            statusElement.className = 'meta-status';
        } else if (charCount < 50) {
            statusIcon.textContent = '📝';
            statusText.textContent = 'Too short - add more details about what readers will learn';
            statusElement.className = 'meta-status status-fair';
        } else if (charCount < 120) {
            statusIcon.textContent = '📈';
            statusText.textContent = `Good start! Add ${120 - charCount} more characters for optimal length`;
            statusElement.className = 'meta-status status-fair';
        } else if (charCount <= 158) {
            statusIcon.textContent = '🌟';
            statusText.textContent = 'Perfect! This will display fully on all devices';
            statusElement.className = 'meta-status status-excellent';
        } else if (charCount <= 180) {
            statusIcon.textContent = '✂️';
            statusText.textContent = `A bit long - trim ${charCount - 158} characters for mobile users`;
            statusElement.className = 'meta-status status-fair';
        } else {
            statusIcon.textContent = '🚨';
            statusText.textContent = `Too long! Google will cut off ${charCount - 158} characters`;
            statusElement.className = 'meta-status status-poor';
        }

        // Update SERP preview
        const serpDescription = document.getElementById('serp-description');
        if (metaText.trim()) {
            // Highlight keywords in preview
            let previewText = metaText.length > 158 ?
                metaText.substring(0, 158) + '...' :
                metaText;

            // Highlight target keyword if it exists
            if (this.targetKeyword && this.targetKeyword.trim()) {
                const keyword = this.targetKeyword.trim();
                const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                previewText = previewText.replace(regex, `<strong>$&</strong>`);
            }

            serpDescription.innerHTML = previewText;
        } else {
            serpDescription.textContent = `Write a description about ${this.targetKeyword || 'your topic'} that makes people want to click...`;
        }

        // Update meta tips with task styling
        const metaTipsContainer = document.querySelector('.meta-tips ul');
        if (metaTipsContainer) {
            const metaTips = [
                { text: '<strong>Include your keyword</strong> (it gets bolded in search)', type: this.targetKeyword && metaText.toLowerCase().includes(this.targetKeyword.toLowerCase()) ? 'completed' : 'suggestion' },
                { text: '<strong>Make it compelling</strong> - this is your ad copy!', type: charCount > 50 ? 'completed' : 'suggestion' },
                { text: '<strong>Call to action:</strong> "Learn how", "Discover", "Find out"', type: /learn|discover|find|get|how to/i.test(metaText) ? 'completed' : 'suggestion' },
                { text: '<strong>Match search intent</strong> - what are people looking for?', type: 'suggestion' }
            ];

            metaTipsContainer.innerHTML = metaTips.map(tip => {
                let className = '';
                if (tip.type === 'completed') {
                    className = 'task-completed';
                } else if (tip.type === 'warning') {
                    className = 'task-warning';
                } else if (tip.type === 'error') {
                    className = 'task-error';
                } else {
                    className = 'task-suggestion';
                }
                return `<li class="${className}">${tip.text}</li>`;
            }).join('');
        }
    }

    updateWordStatsUI(wordStats) {
        document.getElementById('word-count').textContent = wordStats.words.toLocaleString();
        document.getElementById('reading-time').textContent = wordStats.readingTime;
        document.getElementById('character-count').textContent = wordStats.characters.toLocaleString();
        document.getElementById('sentence-count').textContent = wordStats.sentences.toLocaleString();

        // Update insights with actionable advice
        const insightsContainer = document.getElementById('content-insights');
        const insights = [];

        if (wordStats.words === 0) {
            insights.push('✍️ Start writing! Paste your content above to get SEO insights');
        } else if (wordStats.words < 300) {
            insights.push('📝 Too short! Google prefers content over 300 words');
            insights.push('💡 Tip: Add more details, examples, or sections to reach 1,500+ words');
        } else if (wordStats.words < 1000) {
            insights.push('📈 Good start! Aim for 1,500+ words for better rankings');
            insights.push('✨ Ideas: Add examples, FAQs, or step-by-step instructions');
        } else if (wordStats.words < 1500) {
            insights.push('👍 Getting better! You\'re close to the sweet spot of 1,500-2,500 words');
            insights.push('🎯 Add one more section or expand existing points');
        } else if (wordStats.words <= 2500) {
            insights.push('🌟 Perfect length! This is ideal for ranking well in search results');
        } else if (wordStats.words <= 4000) {
            insights.push('📚 Very comprehensive! Make sure every section adds value');
        } else {
            insights.push('📖 Extremely long content - consider breaking into multiple pages');
        }

        if (wordStats.sentences > 0) {
            const avgWordsPerSentence = Math.round(wordStats.words / wordStats.sentences);
            if (avgWordsPerSentence > 30) {
                insights.push('✂️ Your sentences are too long! Break them into 2-3 shorter ones');
            } else if (avgWordsPerSentence > 25) {
                insights.push('📝 Consider shorter sentences - aim for 15-20 words each');
            } else if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
                insights.push('✅ Perfect sentence length - easy to read and understand!');
            } else if (avgWordsPerSentence < 10) {
                insights.push('🔗 Your sentences are quite short - consider combining some');
            }
        }

        insightsContainer.innerHTML = insights.map(insight => {
            const icon = insight.split(' ')[0];
            const text = insight.substring(insight.indexOf(' ') + 1);
            let className = 'insight-item';

            // Determine task type based on icon
            if (icon === '✅' || icon === '🌟') {
                className += ' task-completed';
            } else if (icon === '⚠️' || icon === '📝') {
                className += ' task-warning';
            } else if (icon === '❌' || icon === '🚨') {
                className += ' task-error';
            } else {
                className += ' task-suggestion';
            }

            return `<div class="${className}">
                <span class="insight-text">${text}</span>
            </div>`;
        }).join('');
    }

    updateReadabilityUI(readabilityScores) {
        // Update scores
        document.getElementById('flesch-ease').textContent = readabilityScores.fleschEase;
        document.getElementById('flesch-ease-grade').textContent = readabilityScores.fleschEaseGrade;
        document.getElementById('flesch-kincaid').textContent = readabilityScores.fleschKincaid;
        document.getElementById('flesch-kincaid-grade').textContent = readabilityScores.fleschKincaidGrade;
        document.getElementById('smog-index').textContent = readabilityScores.smogIndex;
        document.getElementById('smog-grade').textContent = readabilityScores.smogGrade;

        // Update recommendation with actionable guidance
        const recommendation = document.getElementById('readability-recommendation');
        const recommendationText = recommendation.querySelector('span:last-child');

        if (readabilityScores.fleschKincaid >= 7 && readabilityScores.fleschKincaid <= 8) {
            recommendation.className = 'readability-recommendation status-excellent';
            recommendationText.textContent = '🌟 Perfect! Your content is easy for everyone to understand';
        } else if (readabilityScores.fleschKincaid < 7) {
            recommendation.className = 'readability-recommendation status-good';
            recommendationText.textContent = '📖 Great! Very easy to read - perfect for broad audiences';
        } else if (readabilityScores.fleschKincaid <= 10) {
            recommendation.className = 'readability-recommendation status-fair';
            recommendationText.textContent = '📚 A bit complex - consider shorter sentences for better readability';
        } else if (readabilityScores.fleschKincaid <= 14) {
            recommendation.className = 'readability-recommendation status-fair';
            recommendationText.textContent = '🎓 Too complex - most readers will struggle. Simplify your language!';
        } else {
            recommendation.className = 'readability-recommendation status-poor';
            recommendationText.textContent = '🚨 Very hard to read! Break up sentences and use simpler words';
        }

        // Add specific tips based on readability scores
        const wordStats = this.analysisResults?.wordStats;
        if (wordStats && wordStats.sentences > 0) {
            const avgWordsPerSentence = Math.round(wordStats.words / wordStats.sentences);

            // Update the readability tips based on actual content analysis
            const tipsContainer = document.querySelector('.readability-tips ul');
            if (tipsContainer) {
                const tips = [];

                if (avgWordsPerSentence > 25) {
                    tips.push(`<strong>Shorten sentences:</strong> Your average is ${avgWordsPerSentence} words - aim for 15-20`);
                } else if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
                    tips.push('<strong>Perfect sentence length!</strong> Keep writing like this');
                } else {
                    tips.push('<strong>Good sentence length:</strong> You could vary it a bit more');
                }

                if (readabilityScores.fleschKincaid > 10) {
                    tips.push('<strong>Use simpler words:</strong> Replace complex terms with everyday language');
                    tips.push('<strong>Break up paragraphs:</strong> Keep them to 3-5 sentences max');
                } else if (readabilityScores.fleschKincaid >= 7 && readabilityScores.fleschKincaid <= 8) {
                    tips.push('<strong>Excellent readability!</strong> Your audience will love this');
                } else {
                    tips.push('<strong>Very readable:</strong> Great for reaching more people');
                }

                if (wordStats.words > 500) {
                    tips.push('<strong>Add subheadings:</strong> Break up long sections for better flow');
                    tips.push('<strong>Use bullet points:</strong> Lists are easier to scan and read');
                }

                tipsContainer.innerHTML = tips.map(tip => {
                    let className = '';
                    if (tip.includes('Perfect') || tip.includes('Excellent')) {
                        className = 'task-completed';
                    } else if (tip.includes('Shorten') || tip.includes('Use simpler')) {
                        className = 'task-warning';
                    } else {
                        className = 'task-suggestion';
                    }
                    return `<li class="${className}">${tip}</li>`;
                }).join('');
            }
        }
    }

    updateKeywordAnalysisUI(keywordAnalysis) {
        // Update primary keyword density
        document.getElementById('primary-keyword-density').textContent =
            keywordAnalysis.primaryKeywordDensity + '%';
        document.getElementById('keyword-count').textContent = keywordAnalysis.primaryKeywordCount;

        // Update status with detailed guidance
        const statusElement = document.getElementById('keyword-status');
        const statusIcon = statusElement.querySelector('.status-icon');
        const statusText = statusElement.querySelector('span:last-child');

        // Update keyword tips based on analysis
        const tipsContainer = document.getElementById('keyword-tips-list');
        const tips = [];

        if (!this.targetKeyword.trim()) {
            statusIcon.textContent = '💡';
            statusText.textContent = 'Enter your target keyword above to check usage';
            statusElement.className = 'keyword-status';
            tips.push('<strong>Get started:</strong> Enter the main word/phrase you want to rank for');
            tips.push('<strong>Research tip:</strong> Use Google to see what people search for');
            tips.push('<strong>Be specific:</strong> "best coffee makers" vs just "coffee"');
        } else if (keywordAnalysis.primaryKeywordDensity === 0) {
            statusIcon.textContent = '❌';
            statusText.textContent = `"${this.targetKeyword}" not found in your content`;
            statusElement.className = 'keyword-status status-poor';
            tips.push(`<strong>Add your keyword:</strong> Include "${this.targetKeyword}" naturally in your text`);
            tips.push('<strong>Best places:</strong> Title, first paragraph, and headings');
            tips.push('<strong>Don\'t force it:</strong> Only add where it makes sense');
        } else if (keywordAnalysis.primaryKeywordDensity < 0.5) {
            statusIcon.textContent = '📈';
            statusText.textContent = 'Use your keyword more often (aim for 1-2%)';
            statusElement.className = 'keyword-status status-fair';
            tips.push(`<strong>Add more:</strong> Include "${this.targetKeyword}" ${Math.ceil((this.analysisResults?.wordStats?.words || 1000) * 0.015) - keywordAnalysis.primaryKeywordCount} more times`);
            tips.push('<strong>Natural placement:</strong> In headings, image captions, and conclusion');
            tips.push('<strong>Variations:</strong> Use related phrases like synonyms');
        } else if (keywordAnalysis.primaryKeywordDensity <= 2) {
            statusIcon.textContent = '🌟';
            statusText.textContent = 'Perfect! Your keyword usage looks natural';
            statusElement.className = 'keyword-status status-excellent';
            tips.push('<strong>Well done!</strong> Your keyword density is in the sweet spot');
            tips.push('<strong>Keep it natural:</strong> Don\'t add more unless it fits naturally');
            tips.push('<strong>Focus on quality:</strong> Make sure your content is helpful');
        } else if (keywordAnalysis.primaryKeywordDensity <= 3) {
            statusIcon.textContent = '⚠️';
            statusText.textContent = 'A bit high - reduce keyword usage slightly';
            statusElement.className = 'keyword-status status-fair';
            tips.push(`<strong>Reduce slightly:</strong> Remove ${keywordAnalysis.primaryKeywordCount - Math.floor((this.analysisResults?.wordStats?.words || 1000) * 0.02)} instances of "${this.targetKeyword}"`);
            tips.push('<strong>Use synonyms:</strong> Replace some with related terms');
            tips.push('<strong>Focus on value:</strong> Prioritize helpful content over keyword stuffing');
        } else {
            statusIcon.textContent = '🚨';
            statusText.textContent = 'Too high! Google might see this as spam';
            statusElement.className = 'keyword-status status-poor';
            tips.push(`<strong>Urgent:</strong> Remove ${keywordAnalysis.primaryKeywordCount - Math.floor((this.analysisResults?.wordStats?.words || 1000) * 0.02)} instances of "${this.targetKeyword}"`);
            tips.push('<strong>Rewrite naturally:</strong> Replace repetitive keywords with pronouns');
            tips.push('<strong>Add more content:</strong> Expand your article to dilute keyword density');
        }

        tipsContainer.innerHTML = tips.map(tip => {
            let className = '';
            if (tip.includes('Well done!') || tip.includes('Perfect')) {
                className = 'task-completed';
            } else if (tip.includes('Urgent:') || tip.includes('Too high')) {
                className = 'task-error';
            } else if (tip.includes('Reduce') || tip.includes('Remove')) {
                className = 'task-warning';
            } else {
                className = 'task-suggestion';
            }
            return `<li class="${className}">${tip}</li>`;
        }).join('');

        // Update top keywords
        const keywordList = document.getElementById('keyword-list');
        if (keywordAnalysis.topKeywords.length > 0) {
            keywordList.innerHTML = keywordAnalysis.topKeywords.slice(0, 8).map((keyword, index) =>
                `<span class="keyword-tag ${index >= 3 ? 'secondary' : ''}" title="Used ${keyword.count} times (${keyword.density}% of content)">
                    ${keyword.word} <small>(${keyword.count})</small>
                </span>`
            ).join('');
        } else {
            keywordList.innerHTML = '<span class="keyword-tag secondary">Add content to see your top words</span>';
        }
    }

    updateHeadingStructureUI(headingStructure) {
        // Update heading count
        document.getElementById('heading-count').textContent = headingStructure.totalHeadings;

        // Update H1 status with actionable guidance
        const h1Status = document.getElementById('h1-status');
        const h1StatusIcon = h1Status.querySelector('.status-icon');
        const h1StatusText = h1Status.querySelector('span:last-child');

        // Update recommendations based on content analysis
        const recommendationsContainer = document.getElementById('heading-recommendations');
        const recommendations = [];

        if (headingStructure.totalHeadings === 0) {
            h1StatusIcon.textContent = '📝';
            h1StatusText.textContent = 'Add headings to organize your content!';
            h1Status.className = 'h1-status status-poor';

            recommendations.push('🎯 Start with one main title using # at the beginning');
            recommendations.push('📚 Add section headings using ## for major topics');
            recommendations.push('⚡ Break long paragraphs with ### subheadings');
            recommendations.push(`💡 For "${this.targetKeyword || 'your keyword'}" - include it in your main heading`);
        } else if (!headingStructure.hasH1) {
            h1StatusIcon.textContent = '❌';
            h1StatusText.textContent = 'Missing main title (H1)';
            h1Status.className = 'h1-status status-poor';

            recommendations.push('🎯 Add a main title with # at the very top of your content');
            recommendations.push(`💡 Example: "# The Complete Guide to ${this.targetKeyword || 'Your Topic'}"`);
            recommendations.push('📏 Keep your H1 under 60 characters for best results');
        } else if (headingStructure.multipleH1) {
            h1StatusIcon.textContent = '⚠️';
            h1StatusText.textContent = 'Use only one main title (H1)';
            h1Status.className = 'h1-status status-fair';

            recommendations.push('✂️ Change extra # titles to ## (section headings)');
            recommendations.push('🎯 Keep only one main # title at the top');
            recommendations.push('📖 Use ## for major sections, ### for subsections');
        } else {
            h1StatusIcon.textContent = '✅';
            h1StatusText.textContent = 'Great heading structure!';
            h1Status.className = 'h1-status status-excellent';

            if (headingStructure.totalHeadings < 3) {
                recommendations.push('📈 Consider adding more section headings (##)');
                recommendations.push('🎯 Break long content into digestible sections');
            } else {
                recommendations.push('🌟 Perfect! Your content is well-organized');
            }
            recommendations.push(`💡 Include "${this.targetKeyword || 'your keyword'}" in 1-2 headings naturally`);
        }

        // Add specific guidance for plain text content
        if (this.content && this.content.length > 500 && headingStructure.totalHeadings === 0) {
            recommendations.push('✨ Pro tip: Copy your content and add # before main topics');
            recommendations.push('🚀 This simple change can boost your SEO score by 20-30 points!');
        }

        recommendationsContainer.innerHTML = recommendations.map(rec => {
            const icon = rec.split(' ')[0];
            const text = rec.substring(rec.indexOf(' ') + 1);
            let className = 'recommendation-item';

            // Determine task type based on icon
            if (icon === '✅' || icon === '🌟' || icon === '🏆') {
                className += ' task-completed';
            } else if (icon === '⚠️' || icon === '✂️') {
                className += ' task-warning';
            } else if (icon === '❌' || icon === '🚨') {
                className += ' task-error';
            } else {
                className += ' task-suggestion';
            }

            return `<div class="${className}">
                <span>${text}</span>
            </div>`;
        }).join('');

        // Update heading structure display with better guidance
        const structureContainer = document.getElementById('heading-structure');
        if (headingStructure.headings.length > 0) {
            structureContainer.innerHTML = headingStructure.headings.map(heading =>
                `<div class="structure-item">
                    <span class="structure-level">H${heading.level}</span>
                    <span class="structure-text">${heading.text}</span>
                </div>`
            ).join('');
        } else {
            const wordCount = this.analysisResults?.wordStats?.words || 0;
            if (wordCount === 0) {
                structureContainer.innerHTML = '<div class="structure-item"><span class="structure-label">📝 Add content first, then we\'ll help you organize it</span></div>';
            } else if (wordCount < 200) {
                structureContainer.innerHTML = '<div class="structure-item"><span class="structure-label">✍️ Add more content, then break it up with headings</span></div>';
            } else {
                structureContainer.innerHTML = '<div class="structure-item"><span class="structure-label">💡 Add headings using # for title, ## for sections</span></div>';
            }
        }
    }

    updateSEOScoreUI(seoScore) {
        // Update overall score with animation
        const scoreElement = document.getElementById('overall-score');
        this.animateNumber(scoreElement, 0, seoScore.overall, 1000);

        // Update breakdown scores
        document.getElementById('content-quality-score').textContent = seoScore.contentQuality;
        document.getElementById('technical-seo-score').textContent = seoScore.technicalSEO;
        document.getElementById('readability-score').textContent = seoScore.readability;

        // Update score interpretation
        const interpretationElement = document.getElementById('score-interpretation');
        const interpretationText = interpretationElement.querySelector('.interpretation-text');

        if (seoScore.overall >= 80) {
            interpretationText.textContent = '🌟 Excellent! Your content is well-optimized for search engines';
            interpretationText.className = 'interpretation-text status-excellent';
        } else if (seoScore.overall >= 60) {
            interpretationText.textContent = '👍 Good work! A few tweaks could boost your rankings';
            interpretationText.className = 'interpretation-text status-good';
        } else if (seoScore.overall >= 40) {
            interpretationText.textContent = '📈 Getting there! Follow the tips below to improve';
            interpretationText.className = 'interpretation-text status-fair';
        } else {
            interpretationText.textContent = '🚀 Lots of room to improve! Start with the red items';
            interpretationText.className = 'interpretation-text status-poor';
        }

        // Update score card color based on score
        const scoreCard = document.querySelector('.score-card');
        scoreCard.className = 'metric-card score-card';

        if (seoScore.overall >= 80) {
            scoreCard.classList.add('status-excellent');
        } else if (seoScore.overall >= 60) {
            scoreCard.classList.add('status-good');
        } else if (seoScore.overall >= 40) {
            scoreCard.classList.add('status-fair');
        } else {
            scoreCard.classList.add('status-poor');
        }
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const currentValue = Math.round(start + (end - start) * this.easeOutCubic(progress));
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    resetAnalysis() {
        // Reset all displays to default values
        document.getElementById('overall-score').textContent = '--';
        document.getElementById('content-quality-score').textContent = '--';
        document.getElementById('technical-seo-score').textContent = '--';
        document.getElementById('readability-score').textContent = '--';

        document.getElementById('word-count').textContent = '--';
        document.getElementById('reading-time').textContent = '--';
        document.getElementById('character-count').textContent = '--';
        document.getElementById('sentence-count').textContent = '--';

        document.getElementById('flesch-ease').textContent = '--';
        document.getElementById('flesch-kincaid').textContent = '--';
        document.getElementById('smog-index').textContent = '--';
        document.getElementById('flesch-ease-grade').textContent = '--';
        document.getElementById('flesch-kincaid-grade').textContent = '--';
        document.getElementById('smog-grade').textContent = '--';

        document.getElementById('primary-keyword-density').textContent = '--%';
        document.getElementById('keyword-count').textContent = '--';
        document.getElementById('keyword-list').innerHTML = '<span class="keyword-tag secondary">Add content to see your top words</span>';

        document.getElementById('heading-count').textContent = '0';
        document.getElementById('heading-structure').innerHTML = '<div class="structure-item"><span class="structure-label">📝 Add content first, then we\'ll help you organize it</span></div>';

        // Reset insights with encouraging defaults
        document.getElementById('content-insights').innerHTML = `
            <div class="insight-item">
                <span class="insight-icon">✨</span>
                <span class="insight-text">Paste your content above and watch your SEO score appear!</span>
            </div>`;

        // Reset score interpretation
        const interpretationElement = document.getElementById('score-interpretation');
        const interpretationText = interpretationElement.querySelector('.interpretation-text');
        interpretationText.textContent = 'Add content above to see your SEO score';
        interpretationText.className = 'interpretation-text';

        // Reset keyword tips
        const tipsContainer = document.getElementById('keyword-tips-list');
        if (tipsContainer) {
            tipsContainer.innerHTML = `
                <li><strong>Natural usage:</strong> Don't force keywords - write naturally</li>
                <li><strong>Variations:</strong> Use related words ("coffee brewing" + "making coffee")</li>
                <li><strong>Placement:</strong> Include in title, first paragraph, and headings</li>`;
        }

        // Reset keyword status
        document.getElementById('keyword-status').innerHTML = '<span class="status-icon">💡</span><span>Enter your target keyword above to check usage</span>';

        // Reset readability recommendation
        document.getElementById('readability-recommendation').innerHTML = '<span class="insight-icon">🎯</span><span>Aim for 7th-8th grade level - easy for everyone to read!</span>';

        // Reset heading status
        document.getElementById('h1-status').innerHTML = '<span class="status-icon">💡</span><span>Add headings to your content!</span>';

        // Reset meta analysis
        document.getElementById('meta-character-count').textContent = '0';
        document.getElementById('meta-length-status').textContent = 'Perfect length!';
        document.getElementById('serp-description').textContent = 'Write your meta description above to see how it looks...';

        // Reset meta length bar
        const metaLengthFill = document.getElementById('meta-length-fill');
        if (metaLengthFill) {
            metaLengthFill.style.width = '0%';
            metaLengthFill.className = 'length-fill';
        }

        // Reset meta status
        document.getElementById('meta-status').innerHTML = '<span class="status-icon">💡</span><span>Sweet spot: 120-158 characters to show fully on all devices</span>';

        // Reset score card styling
        const scoreCard = document.querySelector('.score-card');
        if (scoreCard) {
            scoreCard.className = 'metric-card score-card';
        }

        // Reset all status classes and styles on metric cards
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach(card => {
            card.className = card.classList.contains('score-card') ? 'metric-card score-card' : 'metric-card';
        });

        // Reset all status indicators to default state
        const statusElements = document.querySelectorAll('.status-excellent, .status-good, .status-fair, .status-poor');
        statusElements.forEach(element => {
            element.className = element.className.replace(/status-(excellent|good|fair|poor)/g, '');
        });

        // Only scroll and focus if not initial page load
        if (!this.isInitialLoad) {
            // Scroll back to top of page (textarea area)
            document.getElementById('content-input').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Focus on the textarea for better UX
            setTimeout(() => {
                document.getElementById('content-input').focus();
            }, 500);
        }
    }

    exportJSON() {
        if (!this.analysisResults || Object.keys(this.analysisResults).length === 0) {
            alert('No analysis data to export. Please analyze some content first.');
            return;
        }

        const exportData = {
            ...this.analysisResults,
            metadata: {
                exportedAt: new Date().toISOString(),
                tool: 'SEO Content Analyzer',
                version: '1.0'
            },
            content: {
                text: this.content.substring(0, 1000) + (this.content.length > 1000 ? '...' : ''),
                targetKeyword: this.targetKeyword,
                metaDescription: this.metaDescription
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `seo-analysis-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    exportCSV() {
        if (!this.analysisResults || Object.keys(this.analysisResults).length === 0) {
            alert('No analysis data to export. Please analyze some content first.');
            return;
        }

        const { wordStats, readabilityScores, keywordAnalysis, seoScore } = this.analysisResults;

        const csvData = [
            ['Metric', 'Value', 'Status/Grade'],
            ['Overall SEO Score', seoScore.overall, this.getScoreStatus(seoScore.overall)],
            ['Content Quality Score', seoScore.contentQuality, this.getScoreStatus(seoScore.contentQuality)],
            ['Technical SEO Score', seoScore.technicalSEO, this.getScoreStatus(seoScore.technicalSEO)],
            ['Readability Score', seoScore.readability, this.getScoreStatus(seoScore.readability)],
            ['', '', ''],
            ['Word Count', wordStats.words, this.getWordCountStatus(wordStats.words)],
            ['Character Count', wordStats.characters, ''],
            ['Sentence Count', wordStats.sentences, ''],
            ['Reading Time (minutes)', wordStats.readingTime, ''],
            ['', '', ''],
            ['Flesch Reading Ease', readabilityScores.fleschEase, readabilityScores.fleschEaseGrade],
            ['Flesch-Kincaid Grade', readabilityScores.fleschKincaid, readabilityScores.fleschKincaidGrade],
            ['SMOG Index', readabilityScores.smogIndex, readabilityScores.smogGrade],
            ['', '', ''],
            ['Primary Keyword Density (%)', keywordAnalysis.primaryKeywordDensity, keywordAnalysis.status],
            ['Primary Keyword Count', keywordAnalysis.primaryKeywordCount, ''],
            ['Target Keyword', this.targetKeyword, ''],
        ];

        // Add top keywords
        if (keywordAnalysis.topKeywords.length > 0) {
            csvData.push(['', '', '']);
            csvData.push(['Top Keywords', 'Count', 'Density (%)']);
            keywordAnalysis.topKeywords.forEach(keyword => {
                csvData.push([keyword.word, keyword.count, keyword.density]);
            });
        }

        const csvContent = csvData.map(row =>
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `seo-analysis-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getScoreStatus(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    }

    getWordCountStatus(wordCount) {
        if (wordCount >= 1500 && wordCount <= 2500) return 'Optimal';
        if (wordCount >= 1000 && wordCount <= 3000) return 'Good';
        if (wordCount >= 500) return 'Acceptable';
        return 'Too Short';
    }

    clearContent() {
        if (confirm('Are you sure you want to clear all content? This action cannot be undone.')) {
            // Mark that we're clearing content to handle scroll after reload
            sessionStorage.setItem('scrollToTop', 'true');

            // Force page reload for complete reset
            window.location.reload();
        }
    }
}

// Initialize the analyzer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we need to scroll to top after clearing content
    if (sessionStorage.getItem('scrollToTop') === 'true') {
        sessionStorage.removeItem('scrollToTop');
        window.scrollTo(0, 0);

        // Also focus on the textarea after a brief delay
        setTimeout(() => {
            document.getElementById('content-input').focus();
        }, 100);
    }

    new SEOContentAnalyzer();
});