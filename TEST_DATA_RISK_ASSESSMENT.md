# Risk Assessment Test Data Guide

## Quick Test Data for EU AI Act System

### Test Case 1: Bias & Fairness Assessment (High Risk)

**Category:** Bias & Fairness  
**Risk Level:** High  
**Assessment Details:**
```
Demographic parity analysis shows 15% disparity in approval rates between groups. Equal opportunity testing revealed significant differences in loan approval rates: 78% for Group A vs 63% for Group B. Calibration differences were observed across protected attributes including gender and age. Protected attributes tested include race, gender, age, and geographic location. Specific examples of unfair treatment include: automated resume screening system showing 20% lower callback rates for candidates with non-European names, and credit scoring model displaying 12% approval rate gap between urban and rural applicants.
```

**Evidence Links:**
- https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202401689
- https://ai-act-service-desk.ec.europa.eu/en/resources
- https://artificialintelligenceact.eu/ai-act-explorer/
- https://ai-act-service-desk.ec.europa.eu/en/ai-act-explorer

---

### Test Case 2: Robustness & Performance Assessment (Medium Risk)

**Category:** Robustness & Performance  
**Risk Level:** Medium  
**Assessment Details:**
```
Model accuracy drops 8% on adversarial examples. Performance degrades significantly when handling edge cases such as: input data with missing values (15% accuracy drop), extreme values outside training distribution (12% drop), and adversarial perturbations (8% drop). Error handling failures were observed in 3 out of 10 stress test scenarios. Accuracy degradation scenarios include: handling of non-standard date formats, processing of multilingual content, and dealing with corrupted image inputs. Stress test outcomes revealed system instability under high load conditions (>1000 requests/minute).
```

**Evidence Links:**
- https://artificialintelligenceact.eu/the-act
- https://ai-act-service-desk.ec.europa.eu/en/resources

---

### Test Case 3: Privacy & Data Leakage Assessment (High Risk)

**Category:** Privacy & Data Leakage  
**Risk Level:** High  
**Assessment Details:**
```
Data minimization review identified unnecessary collection of personal data including full addresses when only city-level location was required. Anonymization techniques show potential for re-identification risks - k-anonymity analysis revealed 23% of records could be re-identified with 3 attributes. Inference attack vulnerabilities were discovered: membership inference attacks achieved 67% success rate, and attribute inference attacks showed 45% accuracy. Re-identification risks were assessed as HIGH for datasets containing postcode, age, and gender combinations. GDPR compliance concerns include: lack of explicit consent mechanisms, insufficient data retention policies, and missing data subject access request procedures.
```

**Evidence Links:**
- https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202401689
- https://ai-act-service-desk.ec.europa.eu/en/resources
- https://artificialintelligenceact.eu/ai-act-explorer/

---

### Test Case 4: Explainability Assessment (Low Risk)

**Category:** Explainability  
**Risk Level:** Low  
**Assessment Details:**
```
Feature importance explanations are clear for technical users but require simplification for non-technical stakeholders. Decision transparency is limited when processing complex multi-factor decisions - explanation quality drops from 85% to 62% for decisions involving more than 5 features. Counterfactual explanation quality is good for simple cases but degrades for edge cases. Model interpretability limitations include: inability to explain interactions between more than 3 features simultaneously, and limited support for explaining temporal patterns. User understanding barriers were identified: 40% of non-technical users found explanations confusing, and explanation length (average 250 words) exceeds recommended 150-word threshold.
```

**Evidence Links:**
- https://artificialintelligenceact.eu/the-act
- https://ai-act-service-desk.ec.europa.eu/en/ai-act-explorer

---

## EU AI Act Official Resources (Use as Evidence Links)

### Official Legal Documents
1. **Official EU AI Act Text (EUR-LEX)**
   - URL: `https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202401689`
   - Description: Official legal text of Regulation (EU) 2024/1689

2. **AI Act Service Desk - Resources**
   - URL: `https://ai-act-service-desk.ec.europa.eu/en/resources`
   - Description: Legal documents, guidelines, fact sheets, webinars, and compliance templates

3. **AI Act Explorer**
   - URL: `https://artificialintelligenceact.eu/ai-act-explorer/`
   - Description: Interactive tool to browse chapters, annexes, and recitals

4. **AI Act Service Desk Explorer**
   - URL: `https://ai-act-service-desk.ec.europa.eu/en/ai-act-explorer`
   - Description: Compliance checker and navigation tool

5. **The Act Texts**
   - URL: `https://artificialintelligenceact.eu/the-act`
   - Description: Complete regulation text and summaries

### Additional Compliance Resources
- **AI Act Whistleblower Tool**: `https://ai-act-whistleblower.integrityline.app`
- **CELEX Number**: 32024R1689 (for searching in EUR-LEX)

---

## Quick Copy-Paste Test Data

### Minimal Test (Low Risk)
```
Category: Bias & Fairness
Risk Level: Low
Assessment Details: Minor demographic parity differences observed (3% variance). No significant fairness issues detected.
Evidence Links: https://artificialintelligenceact.eu/the-act
```

### Standard Test (Medium Risk)
```
Category: Robustness & Performance
Risk Level: Medium
Assessment Details: Model accuracy drops 8% on adversarial examples. Performance degrades on edge cases. Error handling needs improvement.
Evidence Links: https://ai-act-service-desk.ec.europa.eu/en/resources
```

### Comprehensive Test (High Risk)
```
Category: Privacy & Data Leakage
Risk Level: High
Assessment Details: Data minimization gaps identified. Anonymization shows re-identification risks. Inference attack vulnerabilities discovered with 67% success rate. GDPR compliance concerns include lack of consent mechanisms.
Evidence Links: 
- https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202401689
- https://ai-act-service-desk.ec.europa.eu/en/resources
- https://artificialintelligenceact.eu/ai-act-explorer/
```
