# User tests

**REGISTER**

Tests of level `user`: a person who did not build the product tries it, and the Product Owner records the outcome. They run against the release candidate with the real model; the person gets no help and no explanation beforehand.

### TST-093 A beginner starts a case without help
level: user
module: system
guards: USABILITY-START-WITHOUT-HELP; THREE-STEP-START; NO-PROMPT-SKILL-NEEDED; UC-001
given: a person who has never used the product and does no DIY regularly, a phone or a laptop with the release candidate open on the start page, no account
input: the person is asked to get help for something broken in their home, in their own words, and is not told what to do next
expect: the person describes the problem and presses the one button without asking how, and sees a plan or a question within one minute

### TST-094 The questions are understood without looking anything up
level: user
module: system
guards: EVERYDAY-LANGUAGE-QUESTIONS; PLAIN-LANGUAGE; SHORT-SENTENCES
given: the case of a dropped and broken vase, described as "A vase fell from the shelf and broke into three pieces. I want to glue it."
input: the person reads the follow-up questions and answers them with what they know
expect: the person answers every question without asking what a word means, and says "not sure" for what they do not know without being stuck

### TST-095 A dangerous case tells the person what to do first
level: user
module: system
guards: NO-GUIDE-FOR-HAZARDS; EMERGENCY-ACTIONS-FIRST; UC-011
given: the release candidate on the start page
input: the person describes "I smell gas in the kitchen." and reads the screen that follows
expect: the person names the first thing to do (leave, open windows, call from outside) and whom to call, within ten seconds, and finds no repair steps

### TST-096 The detail of the explanation fits the person
level: user
module: system
guards: DETAIL-FOLLOWS-PROFILE; SAFETY-CONTENT-PROFILE-INDEPENDENT
given: the same small repair, once with the skill level beginner and once with experienced for its area, on the same release candidate
input: the person reads the plan of each
expect: the beginner finds the basics open and the experienced person finds them folded, and both plans carry the same safety warnings
