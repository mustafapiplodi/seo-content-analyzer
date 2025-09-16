/**
 * Professional SEO Content Analyzer
 * Based on Google 2024-2025 algorithm insights and professional SEO tool methodologies
 */

class SEOContentAnalyzer {
    constructor() {
        console.log('=== SEOContentAnalyzer constructor starting ===');
        this.content = '';
        this.targetKeyword = '';
        this.metaDescription = '';
        this.analysisResults = {};
        this.isInitialLoad = true;

        console.log('Initializing event listeners...');
        this.initializeEventListeners();

        console.log('Running initial analysis...');
        this.updateAnalysis();

        this.isInitialLoad = false;
        console.log('=== SEOContentAnalyzer setup complete ===');
    }

    // Helper function for safe DOM element access
    safeGetElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found in DOM`);
            return null;
        }
        return element;
    }

    // Helper function for safe DOM text content setting
    safeSetTextContent(id, content) {
        const element = this.safeGetElement(id);
        if (element) {
            element.textContent = content;
        }
    }

    // Helper function for safe DOM innerHTML setting
    safeSetInnerHTML(id, html) {
        const element = this.safeGetElement(id);
        if (element) {
            element.innerHTML = html;
        }
    }

    // Calculate pixel width of meta description for different devices
    calculateMetaPixelWidth(text) {
        if (!text || text.trim() === '') {
            return { mobile: 0, desktop: 0, tablet: 0 };
        }

        // Create a hidden canvas for accurate text measurement
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Google's SERP fonts (approximate based on 2024 research)
        const fonts = {
            mobile: '14px/1.4 "Google Sans", Arial, sans-serif',      // Mobile SERP font
            tablet: '14px/1.4 "Google Sans", Arial, sans-serif',      // Tablet SERP font
            desktop: '14px/1.4 "Google Sans", Arial, sans-serif'      // Desktop SERP font
        };

        const results = {};

        // Calculate for each device type
        Object.keys(fonts).forEach(device => {
            context.font = fonts[device];

            // Measure text width with font metrics
            const metrics = context.measureText(text);
            let pixelWidth = metrics.width;

            // Add character-specific adjustments for more accuracy
            const adjustments = this.getCharacterAdjustments(text);
            pixelWidth += adjustments[device] || 0;

            // Apply device-specific multipliers (based on Google SERP behavior)
            const deviceMultipliers = {
                mobile: 1.0,    // Base measurement
                tablet: 1.05,   // Slightly wider spacing
                desktop: 1.1    // Desktop has more generous spacing
            };

            results[device] = Math.round(pixelWidth * deviceMultipliers[device]);
        });

        // Clean up canvas
        canvas.remove();

        return results;
    }

    // Character-specific adjustments for more accurate pixel calculation
    getCharacterAdjustments(text) {
        // Count character types that affect rendering
        const wideChars = (text.match(/[WMQGD]/g) || []).length;          // Wide characters
        const narrowChars = (text.match(/[ijl1\|]/g) || []).length;       // Narrow characters
        const punctuation = (text.match(/[.,;:!?"']/g) || []).length;     // Punctuation
        const spaces = (text.match(/\s/g) || []).length;                  // Spaces

        return {
            mobile: (wideChars * 2) + (narrowChars * -1) + (punctuation * -0.5) + (spaces * -1),
            tablet: (wideChars * 2.2) + (narrowChars * -1.1) + (punctuation * -0.6) + (spaces * -1.1),
            desktop: (wideChars * 2.5) + (narrowChars * -1.2) + (punctuation * -0.7) + (spaces * -1.2)
        };
    }

    initializeEventListeners() {
        const contentInput = this.safeGetElement('content-input');
        const targetKeyword = this.safeGetElement('target-keyword');
        const metaDescription = this.safeGetElement('meta-description');

        // Real-time analysis with debouncing - with null checks
        if (contentInput) {
            console.log('Content input element found, adding event listener');
            contentInput.addEventListener('input', this.debounce(() => {
                this.content = contentInput.value;
                console.log('Content input event fired! Content length:', this.content.length);
                console.log('First 50 characters:', this.content.substring(0, 50));
                this.updateAnalysis();
            }, 300));
        } else {
            console.error('Content input element not found!');
        }

        if (targetKeyword) {
            targetKeyword.addEventListener('input', this.debounce(() => {
                this.targetKeyword = targetKeyword.value;
                this.updateAnalysis();
            }, 300));
        }

        if (metaDescription) {
            metaDescription.addEventListener('input', this.debounce(() => {
                this.metaDescription = metaDescription.value;
                this.updateMetaAnalysis();
            }, 300));
        }

        // Export functionality with safe element access
        const exportJsonBtn = this.safeGetElement('export-json');
        const exportCsvBtn = this.safeGetElement('export-csv');
        const clearContentBtn = this.safeGetElement('clear-content');

        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => this.exportJSON());
        }
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => this.exportCSV());
        }
        if (clearContentBtn) {
            clearContentBtn.addEventListener('click', () => this.clearContent());
        }
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    updateAnalysis() {
        console.log('updateAnalysis called with content length:', this.content.length);

        if (!this.content.trim()) {
            console.log('No content, resetting analysis');
            this.resetAnalysis();
            return;
        }

        try {
            // Perform all analyses
            console.log('Starting analysis calculations...');
            const wordStats = this.calculateWordStats();
            console.log('Word stats:', wordStats);

            const readabilityScores = this.calculateReadabilityScores();
            console.log('Readability scores:', readabilityScores);

            const keywordAnalysis = this.analyzeKeywords();
            console.log('Keyword analysis:', keywordAnalysis);

            const headingStructure = this.analyzeHeadingStructure();
            console.log('Heading structure:', headingStructure);

            const seoScore = this.calculateSEOScore(wordStats, readabilityScores, keywordAnalysis, headingStructure);
            console.log('SEO score:', seoScore);

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
            console.log('Updating UI...');
            this.updateWordStatsUI(wordStats);
            this.updateReadabilityUI(readabilityScores);
            this.updateKeywordAnalysisUI(keywordAnalysis);
            this.updateHeadingStructureUI(headingStructure);
            this.updateSEOScoreUI(seoScore);
            console.log('Analysis complete!');

        } catch (error) {
            console.error('Error in updateAnalysis:', error);
            console.error('Error stack:', error.stack);
        }
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

        // Additional safety checks to prevent invalid calculations
        if (syllables === 0) {
            return {
                fleschEase: 0,
                fleschKincaid: 0,
                smogIndex: 0,
                fleschEaseGrade: 'No text to analyze',
                fleschKincaidGrade: 'No text to analyze',
                smogGrade: 'No text to analyze'
            };
        }

        // Safe division calculations with fallbacks
        const wordsPerSentence = sentences > 0 ? words / sentences : 0;
        const syllablesPerWord = words > 0 ? syllables / words : 0;

        // Flesch Reading Ease: 206.835 - (1.015 × words/sentences) - (84.6 × syllables/words)
        const fleschEase = Math.max(0, Math.min(100,
            206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord)
        ));

        // Flesch-Kincaid Grade Level: 0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59
        const fleschKincaid = Math.max(0,
            0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59
        );

        // SMOG Index with enhanced safety checks
        let smogIndex = 0;
        if (sentences >= 30 && polysyllabicWords >= 0) {
            const smogValue = (polysyllabicWords * 30) / sentences;
            smogIndex = smogValue >= 0 ? 1.043 * Math.sqrt(smogValue) + 3.1291 : 0;
        } else if (polysyllabicWords >= 0) {
            smogIndex = 1.043 * Math.sqrt(Math.max(0, polysyllabicWords)) + 3.1291;
        }

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
            syllableCount += this.countWordSyllables(word);
        });

        return syllableCount;
    }

    // Improved syllable counting for individual words
    countWordSyllables(word) {
        // Remove punctuation and convert to lowercase
        word = word.replace(/[^a-z]/g, '').toLowerCase();
        if (word.length === 0) return 0;

        // Handle special cases
        if (word.length <= 3) return 1;

        // Remove common suffixes that don't add syllables
        word = word.replace(/(ed|es|s)$/, '');

        // Count vowel groups more accurately
        let syllables = 0;
        let previousWasVowel = false;

        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const isVowel = /[aeiouy]/.test(char);

            // Special handling for 'y'
            if (char === 'y') {
                // 'y' is a vowel if it's not at the beginning and follows a consonant
                if (i === 0 || /[aeiouy]/.test(word[i - 1])) {
                    continue; // 'y' is consonant here
                }
            }

            if (isVowel && !previousWasVowel) {
                syllables++;
            }
            previousWasVowel = isVowel;
        }

        // Handle silent 'e' more accurately
        if (word.endsWith('e') && syllables > 1) {
            // Check if it's truly silent
            if (word.length > 2 && !/[aeiouy]/.test(word[word.length - 2])) {
                syllables--;
            }
        }

        // Handle special cases
        if (word.endsWith('le') && word.length > 2 && !/[aeiouy]/.test(word[word.length - 3])) {
            syllables++;
        }

        // Every word has at least one syllable
        return Math.max(1, syllables);
    }

    countPolysyllabicWords() {
        const words = this.content.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        let polysyllabicCount = 0;

        words.forEach(word => {
            const syllables = this.countWordSyllables(word);
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

        // Use the same word counting method as calculateWordStats for consistency
        const totalWords = this.analysisResults?.wordStats?.words || this.content.trim().split(/\s+/).filter(word => word.length > 0).length;

        // Clean words for keyword analysis (but keep totalWords consistent)
        const cleanedWords = this.content.toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
            .split(/\s+/)
            .filter(word => word.length > 0);

        // Primary keyword analysis with improved matching
        let primaryKeywordCount = 0;
        let primaryKeywordDensity = 0;
        let status = 'Enter target keyword for analysis';

        if (this.targetKeyword.trim()) {
            const keyword = this.targetKeyword.toLowerCase().trim();
            const keywordWords = keyword.split(/\s+/).filter(w => w.length > 0);

            if (keywordWords.length === 1) {
                // Single word keyword - exact and stem matching
                const targetWord = keywordWords[0].replace(/[^\w]/g, '');
                primaryKeywordCount = cleanedWords.filter(word => {
                    const cleanWord = word.replace(/[^\w]/g, '');
                    // Exact match
                    if (cleanWord === targetWord) return true;
                    // Basic stem matching (remove common endings)
                    const stemmed = cleanWord.replace(/(ing|ed|er|est|ly|s)$/, '');
                    const targetStemmed = targetWord.replace(/(ing|ed|er|est|ly|s)$/, '');
                    return stemmed === targetStemmed && stemmed.length > 2;
                }).length;
            } else {
                // Multi-word keyword phrase - improved phrase detection
                const text = this.content.toLowerCase().replace(/[^\w\s]/g, ' ');
                const phraseRegex = new RegExp(`\\b${keywordWords.join('\\s+')}\\b`, 'gi');
                const exactMatches = (text.match(phraseRegex) || []).length;

                // Also count partial phrase matches (words appearing close together)
                let partialMatches = 0;
                const words = text.split(/\s+/);
                for (let i = 0; i <= words.length - keywordWords.length; i++) {
                    const slice = words.slice(i, i + keywordWords.length);
                    const matchCount = slice.filter(word =>
                        keywordWords.some(kw => word.includes(kw) || kw.includes(word))
                    ).length;
                    if (matchCount >= Math.ceil(keywordWords.length * 0.7)) {
                        partialMatches++;
                    }
                }

                primaryKeywordCount = exactMatches + Math.floor(partialMatches * 0.5);
            }

            // Calculate density consistently for both single words and phrases
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
        const topKeywords = this.extractTopKeywords(cleanedWords);

        return {
            primaryKeywordDensity: Math.round(primaryKeywordDensity * 100) / 100,
            primaryKeywordCount,
            optimalRange: '0.5-2%',
            status,
            topKeywords,
            semanticKeywords: this.extractSemanticKeywords(cleanedWords)
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

        // Extract H1 text for SEO analysis
        const h1Text = hasH1 ? headings.find(h => h.level === 1)?.text || '' : '';

        return {
            totalHeadings,
            headings,
            headingCounts,
            hasH1,
            multipleH1,
            structureScore: Math.max(0, structureScore),
            issues,
            headingCount: totalHeadings, // For compatibility with new SEO algorithm
            h1Text: h1Text // For keyword analysis in SEO algorithm
        };
    }

    calculateSEOScore(wordStats, readabilityScores, keywordAnalysis, headingStructure) {
        // Professional-grade SEO scoring based on 2024-2025 ranking factors
        const scores = {
            contentQuality: this.calculateContentQualityScore(wordStats, keywordAnalysis),
            technicalSEO: this.calculateTechnicalSEOScore(headingStructure, keywordAnalysis),
            readability: this.calculateReadabilityScore(readabilityScores),
            userExperience: this.calculateUserExperienceScore(wordStats)
        };

        // Weighted calculation (totals 100%)
        const weights = {
            contentQuality: 0.35,    // 35% - Content quality and relevance
            technicalSEO: 0.30,      // 30% - Technical SEO factors
            readability: 0.20,       // 20% - Readability and accessibility
            userExperience: 0.15     // 15% - User experience factors
        };

        // Calculate weighted overall score
        const overallScore = Math.round(
            (scores.contentQuality * weights.contentQuality) +
            (scores.technicalSEO * weights.technicalSEO) +
            (scores.readability * weights.readability) +
            (scores.userExperience * weights.userExperience)
        );

        return {
            overall: Math.min(100, Math.max(0, overallScore)),
            contentQuality: Math.round(scores.contentQuality),
            technicalSEO: Math.round(scores.technicalSEO),
            readability: Math.round(scores.readability),
            userExperience: Math.round(scores.userExperience)
        };
    }

    // Professional content quality scoring
    calculateContentQualityScore(wordStats, keywordAnalysis) {
        let score = 0;

        // Word count optimization (25 points)
        const wordCount = wordStats.words;
        if (wordCount >= 1500 && wordCount <= 2500) {
            score += 25; // Optimal range
        } else if (wordCount >= 1000 && wordCount <= 3000) {
            score += 20; // Good range
        } else if (wordCount >= 500 && wordCount <= 4000) {
            score += 15; // Acceptable range
        } else if (wordCount >= 300) {
            score += 10; // Minimum viable
        } else {
            score += 0; // Too short
        }

        // Keyword optimization (30 points)
        const density = keywordAnalysis.primaryKeywordDensity;
        if (density >= 0.8 && density <= 1.5) {
            score += 30; // Perfect density
        } else if (density >= 0.5 && density <= 2.5) {
            score += 25; // Good density
        } else if (density > 0 && density <= 3.5) {
            score += 15; // Acceptable density
        } else if (density > 3.5) {
            score += 5; // Over-optimization penalty
        }

        // Content depth - semantic keywords (20 points)
        const semanticCount = keywordAnalysis.semanticKeywords?.length || 0;
        if (semanticCount >= 10) {
            score += 20; // Rich semantic content
        } else if (semanticCount >= 5) {
            score += 15; // Good semantic coverage
        } else if (semanticCount >= 2) {
            score += 10; // Basic semantic coverage
        }

        // Sentence structure variety (15 points)
        if (wordStats.sentences > 0) {
            const avgWordsPerSentence = wordStats.words / wordStats.sentences;
            if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 18) {
                score += 15; // Optimal sentence length
            } else if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25) {
                score += 12; // Good sentence length
            } else {
                score += 8; // Needs improvement
            }
        }

        // Content freshness indicators (10 points)
        const topKeywords = keywordAnalysis.topKeywords || [];
        const uniqueKeywordRatio = topKeywords.length / Math.max(1, wordStats.words / 100);
        if (uniqueKeywordRatio >= 0.8) {
            score += 10; // Rich vocabulary
        } else if (uniqueKeywordRatio >= 0.5) {
            score += 7; // Good vocabulary
        } else {
            score += 3; // Limited vocabulary
        }

        return Math.min(100, score);
    }

    // Enhanced technical SEO scoring
    calculateTechnicalSEOScore(headingStructure, keywordAnalysis) {
        let score = 0;

        // Heading structure (40 points)
        if (headingStructure.hasH1) {
            score += 15; // H1 exists

            // Keyword in H1 bonus
            if (this.targetKeyword && headingStructure.h1Text) {
                const h1Text = headingStructure.h1Text.toLowerCase();
                const keyword = this.targetKeyword.toLowerCase();
                if (h1Text.includes(keyword)) {
                    score += 10; // Keyword in H1
                }
            }
        }

        // Proper heading hierarchy
        if (!headingStructure.multipleH1) {
            score += 10; // Single H1
        }

        // Heading distribution
        const totalHeadings = headingStructure.headingCount || 0;
        if (totalHeadings >= 3 && totalHeadings <= 10) {
            score += 10; // Good heading distribution
        } else if (totalHeadings > 0) {
            score += 5; // Some headings present
        }

        // Meta description analysis (30 points)
        const metaLength = this.metaDescription?.length || 0;
        if (metaLength >= 120 && metaLength <= 158) {
            score += 20; // Optimal meta length

            // Keyword in meta description
            if (this.targetKeyword && this.metaDescription) {
                const metaText = this.metaDescription.toLowerCase();
                const keyword = this.targetKeyword.toLowerCase();
                if (metaText.includes(keyword)) {
                    score += 10; // Keyword in meta
                }
            }
        } else if (metaLength >= 100 && metaLength <= 180) {
            score += 15; // Acceptable meta length
        } else if (metaLength > 0) {
            score += 5; // Meta exists but not optimal
        }

        // Content analysis depth (30 points)
        const analysisFactors = [
            keywordAnalysis.primaryKeywordCount > 0, // Keyword usage
            (keywordAnalysis.topKeywords?.length || 0) >= 5, // Vocabulary richness
            this.targetKeyword?.trim().length > 0, // Target keyword set
            metaLength > 0, // Meta description exists
            headingStructure.hasH1, // H1 exists
            totalHeadings >= 2 // Multiple headings
        ];

        const activeFactors = analysisFactors.filter(Boolean).length;
        score += Math.round((activeFactors / analysisFactors.length) * 30);

        return Math.min(100, score);
    }

    // Enhanced readability scoring
    calculateReadabilityScore(readabilityScores) {
        let score = 0;

        // Flesch-Kincaid Grade Level (40 points)
        const fkGrade = readabilityScores.fleschKincaid;
        if (fkGrade >= 6 && fkGrade <= 8) {
            score += 40; // Ideal grade level
        } else if (fkGrade >= 5 && fkGrade <= 10) {
            score += 35; // Good grade level
        } else if (fkGrade >= 4 && fkGrade <= 12) {
            score += 25; // Acceptable grade level
        } else {
            score += 15; // Needs improvement
        }

        // Flesch Reading Ease (30 points)
        const fleschEase = readabilityScores.fleschEase;
        if (fleschEase >= 60 && fleschEase <= 80) {
            score += 30; // Optimal readability
        } else if (fleschEase >= 50 && fleschEase <= 90) {
            score += 25; // Good readability
        } else if (fleschEase >= 30) {
            score += 15; // Acceptable readability
        } else {
            score += 5; // Difficult to read
        }

        // SMOG Index consistency (30 points)
        const smogIndex = readabilityScores.smogIndex;
        const readabilityConsistency = Math.abs(fkGrade - smogIndex);
        if (readabilityConsistency <= 2) {
            score += 30; // Consistent readability scores
        } else if (readabilityConsistency <= 4) {
            score += 20; // Fairly consistent
        } else {
            score += 10; // Inconsistent readability
        }

        return Math.min(100, score);
    }

    // User experience scoring
    calculateUserExperienceScore(wordStats) {
        let score = 0;

        // Reading time optimization (50 points)
        const readingTime = wordStats.readingTime;
        if (readingTime >= 3 && readingTime <= 12) {
            score += 50; // Optimal reading time
        } else if (readingTime >= 2 && readingTime <= 20) {
            score += 40; // Good reading time
        } else if (readingTime >= 1) {
            score += 25; // Acceptable reading time
        }

        // Content scannability (30 points)
        const sentenceCount = wordStats.sentences;
        const wordCount = wordStats.words;

        if (sentenceCount > 0) {
            const avgSentenceLength = wordCount / sentenceCount;
            if (avgSentenceLength <= 20) {
                score += 30; // Easy to scan
            } else if (avgSentenceLength <= 25) {
                score += 20; // Moderately scannable
            } else {
                score += 10; // Hard to scan
            }
        }

        // Content length engagement (20 points)
        if (wordCount >= 800 && wordCount <= 3000) {
            score += 20; // Engaging length
        } else if (wordCount >= 300) {
            score += 15; // Adequate length
        } else {
            score += 5; // Too short for engagement
        }

        return Math.min(100, score);
    }

    updateMetaAnalysis() {
        const metaText = this.metaDescription;
        const charCount = metaText.length;

        // Calculate pixel width for different devices
        const pixelWidths = this.calculateMetaPixelWidth(metaText);

        // Update character count display with pixel info
        this.safeSetTextContent('meta-character-count', `${charCount} chars`);

        // Determine optimal display based on pixel width
        const mobileOptimal = pixelWidths.mobile <= 920; // ~120 chars on mobile
        const desktopOptimal = pixelWidths.desktop <= 1200; // ~158 chars on desktop

        // Update length status based on pixel calculations
        const lengthStatus = this.safeGetElement('meta-length-status');
        if (lengthStatus) {
            if (charCount === 0) {
                lengthStatus.textContent = 'Ready to write!';
            } else if (!mobileOptimal && !desktopOptimal) {
                lengthStatus.textContent = 'Too long for all devices';
            } else if (!mobileOptimal) {
                lengthStatus.textContent = 'Too long for mobile';
            } else if (mobileOptimal && desktopOptimal) {
                lengthStatus.textContent = 'Perfect for all devices!';
            } else {
                lengthStatus.textContent = 'Good for mobile, check desktop';
            }
        }

        // Update progress bar based on pixel width (mobile as primary)
        const maxMobilePixels = 920;
        const fillPercentage = Math.min(100, (pixelWidths.mobile / maxMobilePixels) * 100);
        const metaLengthFill = this.safeGetElement('meta-length-fill');
        if (metaLengthFill) {
            metaLengthFill.style.width = `${fillPercentage}%`;

            // Add visual indicators for different breakpoints
            if (fillPercentage > 100) {
                metaLengthFill.className = 'length-fill length-over';
            } else if (fillPercentage > 85) {
                metaLengthFill.className = 'length-fill length-warning';
            } else if (fillPercentage > 60) {
                metaLengthFill.className = 'length-fill length-good';
            } else {
                metaLengthFill.className = 'length-fill';
            }
        }

        // Update status with pixel-based guidance
        const statusElement = this.safeGetElement('meta-status');
        if (statusElement) {
            const statusIcon = statusElement.querySelector('.status-icon');
            const statusText = statusElement.querySelector('span:last-child');

            if (statusIcon && statusText) {
                if (charCount === 0) {
                    statusIcon.textContent = '✍️';
                    statusText.textContent = 'Write a compelling description to get more clicks from Google';
                    statusElement.className = 'meta-status';
                } else if (pixelWidths.mobile < 300) {
                    statusIcon.textContent = '📝';
                    statusText.textContent = 'Too short - add more details about what readers will learn';
                    statusElement.className = 'meta-status status-fair';
                } else if (mobileOptimal && desktopOptimal) {
                    statusIcon.textContent = '🌟';
                    statusText.textContent = `Perfect! ${pixelWidths.mobile}px mobile, ${pixelWidths.desktop}px desktop - displays fully on all devices`;
                    statusElement.className = 'meta-status status-excellent';
                } else if (mobileOptimal && !desktopOptimal) {
                    statusIcon.textContent = '📱';
                    statusText.textContent = `Good for mobile (${pixelWidths.mobile}px) but will be cut on desktop (${pixelWidths.desktop}px)`;
                    statusElement.className = 'meta-status status-good';
                } else if (!mobileOptimal && desktopOptimal) {
                    statusIcon.textContent = '✂️';
                    statusText.textContent = `Will be cut on mobile (${pixelWidths.mobile}px) - trim for better mobile experience`;
                    statusElement.className = 'meta-status status-fair';
                } else {
                    statusIcon.textContent = '🚨';
                    statusText.textContent = `Too long for all devices! Mobile: ${pixelWidths.mobile}px, Desktop: ${pixelWidths.desktop}px`;
                    statusElement.className = 'meta-status status-poor';
                }
            }
        }

        // Update SERP preview with pixel-based truncation
        const serpDescription = this.safeGetElement('serp-description');
        if (serpDescription) {
            if (metaText.trim()) {
                // Truncate based on mobile pixel limit (more conservative)
                let previewText = metaText;
                if (pixelWidths.mobile > 920) {
                    // Find approximate character cutoff for mobile
                    const cutoffRatio = 920 / pixelWidths.mobile;
                    const cutoffIndex = Math.floor(metaText.length * cutoffRatio);
                    previewText = metaText.substring(0, cutoffIndex) + '...';
                }

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
        this.safeSetTextContent('word-count', wordStats.words.toLocaleString());
        this.safeSetTextContent('reading-time', wordStats.readingTime);
        this.safeSetTextContent('character-count', wordStats.characters.toLocaleString());
        this.safeSetTextContent('sentence-count', wordStats.sentences.toLocaleString());

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
        // Update scores with safe DOM access
        this.safeSetTextContent('flesch-ease', readabilityScores.fleschEase);
        this.safeSetTextContent('flesch-ease-grade', readabilityScores.fleschEaseGrade);
        this.safeSetTextContent('flesch-kincaid', readabilityScores.fleschKincaid);
        this.safeSetTextContent('flesch-kincaid-grade', readabilityScores.fleschKincaidGrade);
        this.safeSetTextContent('smog-index', readabilityScores.smogIndex);
        this.safeSetTextContent('smog-grade', readabilityScores.smogGrade);

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
            const totalWords = this.analysisResults?.wordStats?.words || 1000;
            const optimalCount = Math.round(totalWords * 0.02); // 2% optimal

            // Since we're in the "too high" zone, we should remove instances to get to 2% or below
            let targetCount = optimalCount;
            if (keywordAnalysis.primaryKeywordDensity > 2) {
                // If over 2%, aim for exactly 2%
                targetCount = Math.round(totalWords * 0.02);
            }

            const toRemoveForOptimal = Math.max(0, keywordAnalysis.primaryKeywordCount - targetCount);
            const newDensity = ((keywordAnalysis.primaryKeywordCount - toRemoveForOptimal) / totalWords * 100).toFixed(2);
            const instanceText = toRemoveForOptimal === 1 ? 'instance' : 'instances';

            if (toRemoveForOptimal > 0) {
                tips.push(`<strong>For optimal SEO:</strong> Remove ${toRemoveForOptimal} ${instanceText} to reach ${newDensity}% density (green zone)`);
            } else {
                tips.push(`<strong>Reduce slightly:</strong> Lower usage to reach optimal 2% density`);
            }
            tips.push('<strong>Use synonyms:</strong> Replace some with related terms');
            tips.push('<strong>Focus on value:</strong> Prioritize helpful content over keyword stuffing');
        } else {
            statusIcon.textContent = '🚨';
            statusText.textContent = 'Too high! Google might see this as spam';
            statusElement.className = 'keyword-status status-poor';
            const totalWords = this.analysisResults?.wordStats?.words || 1000;

            // Calculate target count for 2% density (green zone)
            const targetForGreenZone = Math.floor(totalWords * 0.02);

            // Debug logging
            console.log('DEBUG - Keyword calculation:');
            console.log('Total words:', totalWords);
            console.log('Current keyword count:', keywordAnalysis.primaryKeywordCount);
            console.log('Current density:', keywordAnalysis.primaryKeywordDensity + '%');
            console.log('Target for green zone (2%):', targetForGreenZone);

            // Calculate how many to remove to reach green zone
            const toRemoveForOptimal = Math.max(0, keywordAnalysis.primaryKeywordCount - targetForGreenZone);
            console.log('To remove for optimal:', toRemoveForOptimal);

            // Calculate the resulting density after removal
            const resultingCount = keywordAnalysis.primaryKeywordCount - toRemoveForOptimal;
            const newDensity = ((resultingCount) / totalWords * 100).toFixed(2);
            const instanceText = toRemoveForOptimal === 1 ? 'instance' : 'instances';

            tips.push(`<strong>To reach green zone:</strong> Remove ${toRemoveForOptimal} ${instanceText} to get ${newDensity}% density (optimal for SEO)`);
            tips.push(`<strong>Current status:</strong> ${keywordAnalysis.primaryKeywordCount} uses in ${totalWords} words = ${keywordAnalysis.primaryKeywordDensity}% (too high)`);
            tips.push(`<strong>Target:</strong> ${targetForGreenZone} uses max = ${((targetForGreenZone/totalWords)*100).toFixed(1)}% density (Google's sweet spot)`);
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
        console.log('updateSEOScoreUI called with:', seoScore);

        // Update overall score with animation - using safe DOM access
        const scoreElement = this.safeGetElement('overall-score');
        if (scoreElement) {
            this.animateNumber(scoreElement, 0, seoScore.overall, 1000);
        }

        // Update breakdown scores with safe DOM access
        this.safeSetTextContent('content-quality-score', seoScore.contentQuality);
        this.safeSetTextContent('technical-seo-score', seoScore.technicalSEO);
        this.safeSetTextContent('readability-score', seoScore.readability);
        this.safeSetTextContent('user-experience-score', seoScore.userExperience || '--');

        // Update score interpretation with safe DOM access
        const interpretationElement = this.safeGetElement('score-interpretation');
        if (interpretationElement) {
            const interpretationText = interpretationElement.querySelector('.interpretation-text');
            if (interpretationText) {
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
            }
        }

        // Update score card color based on score with safe DOM access
        const scoreCard = this.safeGetElement('score-card') || document.querySelector('.score-card');
        if (scoreCard) {
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

        console.log('SEO Score UI update completed');
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
        this.safeSetTextContent('overall-score', '--');
        this.safeSetTextContent('content-quality-score', '--');
        this.safeSetTextContent('technical-seo-score', '--');
        this.safeSetTextContent('readability-score', '--');
        this.safeSetTextContent('user-experience-score', '--');

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
        try {
            // Validate analysis data exists
            if (!this.analysisResults || Object.keys(this.analysisResults).length === 0) {
                alert('No analysis data to export. Please analyze some content first.');
                return;
            }

            // Validate required data structure
            const { wordStats, readabilityScores, keywordAnalysis, seoScore } = this.analysisResults;
            if (!wordStats || !readabilityScores || !keywordAnalysis || !seoScore) {
                throw new Error('Analysis data is incomplete. Please re-analyze your content.');
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

            // Safely create and validate JSON
            const jsonString = JSON.stringify(exportData, null, 2);
            if (!jsonString || jsonString === '{}') {
                throw new Error('Failed to serialize analysis data');
            }

            // Create blob with error handling
            const blob = new Blob([jsonString], { type: 'application/json' });
            if (blob.size === 0) {
                throw new Error('Failed to create export file');
            }

            // Safely create download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `seo-analysis-${new Date().toISOString().split('T')[0]}.json`;

            // Ensure DOM manipulation is safe
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('JSON export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error.message}. Please try again or contact support.`);
        }
    }

    exportCSV() {
        try {
            // Validate analysis data exists
            if (!this.analysisResults || Object.keys(this.analysisResults).length === 0) {
                alert('No analysis data to export. Please analyze some content first.');
                return;
            }

            // Validate required data structure with safe destructuring
            const { wordStats, readabilityScores, keywordAnalysis, seoScore } = this.analysisResults;
            if (!wordStats || !readabilityScores || !keywordAnalysis || !seoScore) {
                throw new Error('Analysis data is incomplete. Please re-analyze your content.');
            }

            // Safely build CSV data with null checks
            const csvData = [
                ['Metric', 'Value', 'Status/Grade'],
                ['Overall SEO Score', seoScore.overall || 0, this.getScoreStatus(seoScore.overall || 0)],
                ['Content Quality Score', seoScore.contentQuality || 0, this.getScoreStatus(seoScore.contentQuality || 0)],
                ['Technical SEO Score', seoScore.technicalSEO || 0, this.getScoreStatus(seoScore.technicalSEO || 0)],
                ['Readability Score', seoScore.readability || 0, this.getScoreStatus(seoScore.readability || 0)],
                ['', '', ''],
                ['Word Count', wordStats.words || 0, this.getWordCountStatus(wordStats.words || 0)],
                ['Character Count', wordStats.characters || 0, ''],
                ['Sentence Count', wordStats.sentences || 0, ''],
                ['Reading Time (minutes)', wordStats.readingTime || 0, ''],
                ['', '', ''],
                ['Flesch Reading Ease', readabilityScores.fleschEase || 0, readabilityScores.fleschEaseGrade || 'N/A'],
                ['Flesch-Kincaid Grade', readabilityScores.fleschKincaid || 0, readabilityScores.fleschKincaidGrade || 'N/A'],
                ['SMOG Index', readabilityScores.smogIndex || 0, readabilityScores.smogGrade || 'N/A'],
                ['', '', ''],
                ['Primary Keyword Density (%)', keywordAnalysis.primaryKeywordDensity || 0, keywordAnalysis.status || 'No analysis'],
                ['Primary Keyword Count', keywordAnalysis.primaryKeywordCount || 0, ''],
                ['Target Keyword', this.targetKeyword || 'Not specified', ''],
            ];

            // Safely add top keywords with validation
            if (keywordAnalysis.topKeywords && Array.isArray(keywordAnalysis.topKeywords) && keywordAnalysis.topKeywords.length > 0) {
                csvData.push(['', '', '']);
                csvData.push(['Top Keywords', 'Count', 'Density (%)']);
                keywordAnalysis.topKeywords.forEach(keyword => {
                    if (keyword && keyword.word) {
                        csvData.push([keyword.word, keyword.count || 0, keyword.density || 0]);
                    }
                });
            }

            // Safely create CSV content with error handling
            const csvContent = csvData.map(row =>
                row.map(cell => {
                    const cellValue = String(cell != null ? cell : '');
                    return `"${cellValue.replace(/"/g, '""')}"`;
                }).join(',')
            ).join('\n');

            if (!csvContent) {
                throw new Error('Failed to generate CSV content');
            }

            // Create blob with error handling
            const blob = new Blob([csvContent], { type: 'text/csv' });
            if (blob.size === 0) {
                throw new Error('Failed to create CSV file');
            }

            // Safely create download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `seo-analysis-${new Date().toISOString().split('T')[0]}.csv`;

            // Ensure DOM manipulation is safe
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('CSV export completed successfully');
        } catch (error) {
            console.error('CSV export failed:', error);
            alert(`CSV export failed: ${error.message}. Please try again or contact support.`);
        }
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
// Test function removed - debugging complete

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting analyzer initialization...');

    // Check if we need to scroll to top after clearing content
    if (sessionStorage.getItem('scrollToTop') === 'true') {
        sessionStorage.removeItem('scrollToTop');
        window.scrollTo(0, 0);

        // Also focus on the textarea after a brief delay
        setTimeout(() => {
            const textarea = document.getElementById('content-input');
            if (textarea) {
                textarea.focus();
            }
        }, 100);
    }

    try {
        window.analyzer = new SEOContentAnalyzer();
        console.log('SEO Content Analyzer initialized successfully');

    } catch (error) {
        console.error('Failed to initialize SEO Content Analyzer:', error);
        console.error('Error stack:', error.stack);
    }
});