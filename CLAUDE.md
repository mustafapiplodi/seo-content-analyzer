# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an SEO Content Analyzer project based on a comprehensive development guide for building professional-grade SEO analysis tools. The project focuses on implementing advanced content analysis capabilities that match or exceed commercial SEO software.

## Core Architecture

The project is designed around a Python-based SEO content analysis system with the following key components:

### Technology Stack
- **Python 3.9+** as the primary language
- **spaCy 3.5+** for industrial-strength NLP processing
- **transformers library** for BERT/GPT integration
- **scikit-learn** for TF-IDF analysis
- **Microservices architecture** with separate services for:
  - Content analysis
  - SERP tracking
  - Reporting

### Key Analysis Components

1. **Content Quality Analysis**
   - Readability scoring using multiple formulas (Flesch Reading Ease, Flesch-Kincaid, SMOG Index)
   - Keyword density analysis (targeting 0.5-2% for primary keywords)
   - Semantic SEO analysis using NLP and entity recognition
   - Content structure evaluation (H1-H6 heading hierarchy)

2. **Technical SEO Metrics**
   - Meta description optimization (120-158 characters for cross-device compatibility)
   - Content length optimization (1,500-2,500 words for blog posts)
   - Reading time calculations (238 WPM baseline)
   - Core Web Vitals integration (LCP, INP, CLS)

3. **Advanced Features**
   - Topical authority measurement
   - Content gap analysis
   - Competitive scoring algorithms
   - E-E-A-T compliance assessment

## Performance Requirements

- **Real-time analysis**: Under 2 seconds for 1000-word content
- **Batch processing**: 10,000+ documents per hour
- **API response times**: Under 500ms
- **Target uptime**: 99.9%

## Scoring Algorithms

The system implements composite scoring formulas:
- **Content Quality Score**: `(Readability × 0.2) + (Keyword Optimization × 0.3) + (Topic Coverage × 0.3) + (Structure × 0.2)`
- **Technical SEO Score**: `(Meta Optimization × 0.4) + (Heading Structure × 0.3) + (Performance × 0.3)`
- **Competitive Score**: `(Your Score ÷ Average Competitor Score) × 100`

## Development Standards

### SEO Best Practices Implementation
- Follow Google's E-E-A-T framework (Experience, Expertise, Authoritativeness, Trust)
- Implement semantic search optimization using BERT and MUM algorithm insights
- Support mobile-first indexing requirements
- Integrate Core Web Vitals (INP replacing FID as of March 2024)

### Code Quality Requirements
- Implement performance optimization through Cython integration
- Use batch processing with `nlp.pipe()` method for efficiency
- Support GPU acceleration via spacy-transformers
- Include comprehensive error handling and rate limiting

## API Integration

The system supports integration with:
- **Google Search Console API** (1,200 queries per minute limit)
- **SERP analysis APIs** (SerpApi, DataForSEO, SearchAPI.io)
- Export formats: CSV/Excel, JSON, PDF, Google Sheets

## Security and Infrastructure

- **Encryption**: AES-256 for data at rest, TLS 1.3 in transit
- **Authentication**: OAuth 2.0 + JWT
- **Container orchestration**: Kubernetes
- **Caching**: Redis for frequent queries
- **Architecture**: Microservices with separate scaling capabilities

## Report Structure

Professional reports should include:
1. Executive summary with overall scores and key insights
2. Detailed metrics for content quality and technical SEO
3. Competitive analysis with gap identification
4. Actionable recommendations based on current Google algorithm updates