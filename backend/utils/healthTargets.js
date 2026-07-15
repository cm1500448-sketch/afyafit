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

function getHealthTargets(dateOfBirth, currentWeight = 0, goalWeight = 0) {
    const age = calculateAge(dateOfBirth);

    let ageGroup, sleepMin, sleepMax, sleepGoal, waterGoal, stepsGoal, calorieBase;

    if (age === null || (age >= 13 && age <= 18)) {
        ageGroup    = 'Teen (13–18)';
        sleepMin    = 8;
        sleepMax    = 10;
        sleepGoal   = 9;
        waterGoal   = 9;
        stepsGoal   = 10000;
        calorieBase = 2200;
    } else if (age >= 6 && age <= 8) {
        ageGroup    = 'Child (6–8)';
        sleepMin    = 9;
        sleepMax    = 12;
        sleepGoal   = 10;
        waterGoal   = 5;
        stepsGoal   = 12000;
        calorieBase = 1500;
    } else if (age >= 9 && age <= 12) {
        ageGroup    = 'Child (9–12)';
        sleepMin    = 9;
        sleepMax    = 12;
        sleepGoal   = 10;
        waterGoal   = 8;
        stepsGoal   = 11000;
        calorieBase = 1800;
    } else if (age >= 19 && age <= 35) {
        ageGroup    = 'Young Adult (19–35)';
        sleepMin    = 7;
        sleepMax    = 9;
        sleepGoal   = 8;
        waterGoal   = 8;
        stepsGoal   = 8000;
        calorieBase = 2200;
    } else {
        ageGroup    = 'Youth (default)';
        sleepMin    = 8;
        sleepMax    = 10;
        sleepGoal   = 9;
        waterGoal   = 8;
        stepsGoal   = 10000;
        calorieBase = 2000;
    }

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
