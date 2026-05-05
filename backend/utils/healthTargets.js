/**
 * AGE-AWARE HEALTH TARGETS UTILITY
 *
 * All values are sourced from peer-reviewed, internationally recognised guidelines:
 *
 * SLEEP  — American Academy of Sleep Medicine (AASM) / CDC (2016, endorsed by AAP)
 *   Ages  6–12 : 9–12 hours  → use 10 as midpoint target
 *   Ages 13–18 : 8–10 hours  → use  9 as midpoint target
 *   Ages 19–25 : 7–9  hours  → use  8 as midpoint target (young adults)
 *   Ages 26–35 : 7–9  hours  → use  8 as midpoint target (adults)
 *   Source: https://aasm.org/resources/pdf/pediatricsleepdurationconsensus.pdf
 *
 * WATER  — National Academies of Sciences, Engineering & Medicine (NASEM) / AAP
 *   Ages  6–8  : 5 cups  (1250ml) per day
 *   Ages  9–13 : 8 cups  (2000ml) per day
 *   Ages 14–18 : 9 cups  (2250ml) per day  (boys need slightly more; 9 is a safe midpoint)
 *   Ages 19–35 : 8 cups  (2000ml) per day  (general adult baseline)
 *   Source: https://www.nationalacademies.org/our-work/dietary-reference-intakes
 *
 * STEPS  — NIH / CDC Physical Activity Guidelines for Americans (2nd ed., 2018)
 *   Children & adolescents (6–17): 60 min MVPA/day ≈ 10,000–12,000 steps
 *   Young adults (18–35)         : 7,000–10,000 steps/day
 *   Research: Adams et al. (2013), Int J Behav Nutr Phys Act — 60 min MVPA ≈ 11,290–12,512 steps
 *   Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC3639120/
 *
 * CALORIES — USDA Dietary Guidelines for Americans 2020–2025 (moderately active)
 *   Ages  6–8  : 1,400–1,600 kcal → use 1,500
 *   Ages  9–13 : 1,600–2,200 kcal → use 1,800 (midpoint, gender-neutral)
 *   Ages 14–18 : 1,800–3,200 kcal → use 2,200 (midpoint, gender-neutral)
 *   Ages 19–35 : 2,000–3,000 kcal → use 2,200 (general adult baseline)
 *   Source: https://www.dietaryguidelines.gov/
 *
 * AGE RANGE — African Union / Constitution of Kenya 2010 defines youth as 15–35.
 *   AFYAFIT extends this to 6–35 to include school-age children supervised by parents.
 */

/**
 * Calculate the user's age in years from their date_of_birth string (YYYY-MM-DD).
 * Returns null if date_of_birth is missing or invalid.
 *
 * @param {string|null} dateOfBirth - ISO date string e.g. "2005-03-15"
 * @returns {number|null}
 */
function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

/**
 * Get evidence-based daily health targets for a user based on their age.
 * Falls back to sensible youth defaults if age is unknown.
 *
 * @param {string|null} dateOfBirth - ISO date string from user_profiles
 * @param {number} currentWeight    - Current weight in kg (for calorie target)
 * @param {number} goalWeight       - Goal weight in kg (for calorie target)
 * @returns {{
 *   age: number|null,
 *   ageGroup: string,
 *   sleepGoal: number,       // hours per night
 *   sleepMin: number,        // minimum recommended hours
 *   sleepMax: number,        // maximum recommended hours
 *   waterGoal: number,       // cups per day (1 cup = 250ml)
 *   waterGoalMl: number,     // ml per day
 *   stepsGoal: number,       // steps per day
 *   calorieTarget: number,   // kcal per day
 *   source: string           // guideline source label
 * }}
 */
function getHealthTargets(dateOfBirth, currentWeight = 0, goalWeight = 0) {
    const age = calculateAge(dateOfBirth);

    // Determine age group and targets
    let ageGroup, sleepMin, sleepMax, sleepGoal, waterGoal, stepsGoal, calorieBase;

    if (age === null || (age >= 13 && age <= 18)) {
        // Default / Teens 13–18
        ageGroup    = 'Teen (13–18)';
        sleepMin    = 8;
        sleepMax    = 10;
        sleepGoal   = 9;
        waterGoal   = 9;   // cups — NASEM midpoint for 14–18
        stepsGoal   = 10000;
        calorieBase = 2200;
    } else if (age >= 6 && age <= 8) {
        // Children 6–8
        ageGroup    = 'Child (6–8)';
        sleepMin    = 9;
        sleepMax    = 12;
        sleepGoal   = 10;
        waterGoal   = 5;   // cups — NASEM for 6–8
        stepsGoal   = 12000;
        calorieBase = 1500;
    } else if (age >= 9 && age <= 12) {
        // Children 9–12
        ageGroup    = 'Child (9–12)';
        sleepMin    = 9;
        sleepMax    = 12;
        sleepGoal   = 10;
        waterGoal   = 8;   // cups — NASEM for 9–13
        stepsGoal   = 11000;
        calorieBase = 1800;
    } else if (age >= 19 && age <= 35) {
        // Young Adults 19–35 (African Union / Kenya youth definition)
        ageGroup    = 'Young Adult (19–35)';
        sleepMin    = 7;
        sleepMax    = 9;
        sleepGoal   = 8;
        waterGoal   = 8;   // cups — NASEM adult baseline
        stepsGoal   = 8000;
        calorieBase = 2200;
    } else {
        // Fallback for any edge case (e.g. age < 6 or > 35)
        ageGroup    = 'Youth (default)';
        sleepMin    = 8;
        sleepMax    = 10;
        sleepGoal   = 9;
        waterGoal   = 8;
        stepsGoal   = 10000;
        calorieBase = 2000;
    }

    // Adjust calorie target based on weight goal
    // If user is above their goal weight → slight deficit (−200 kcal)
    // If user is at or below goal weight → maintenance
    const isAboveGoal = currentWeight > 0 && goalWeight > 0 && currentWeight > goalWeight;
    const calorieTarget = isAboveGoal ? Math.max(1400, calorieBase - 200) : calorieBase;

    return {
        age,
        ageGroup,
        sleepGoal,
        sleepMin,
        sleepMax,
        waterGoal,
        waterGoalMl: waterGoal * 250,
        stepsGoal,
        calorieTarget,
        source: 'AASM/CDC (sleep), NASEM/AAP (water), NIH/CDC (steps), USDA (calories)'
    };
}

module.exports = { calculateAge, getHealthTargets };
