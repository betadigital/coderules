using {RuleService} from './rule-service';

annotate RuleService.CodeUsers with @(restrict: [
    {
        grant: '*',
        to   : 'RuleAdmin'
    },

    {
        grant: 'READ',
        to   : [
            'authenticated-user',
            'RuleReader',
            'RuleM2M'
        ]
    }
]);

annotate RuleService.UserRules with @(restrict: [
    {
        grant: '*',
        to   : 'RuleAdmin'
    },
    {
        grant: 'WRITE',
        to   : ['RuleCreator']
    },

    {
        grant: 'READ',
        to   : [
            'authenticated-user',
            'RuleReader',
            'RuleM2M'
        ]
    }
]);

annotate RuleService.BaseRules with @(restrict: [{
    grant: 'READ',
    to   : [
        'RuleAdmin',
        'RuleCreator',
        'RuleReader',
        'authenticated-user',
        'RuleM2M'
    ]
}]);

annotate RuleService.RuleTypes with @(restrict: [{
    grant: 'READ',
    to   : [
        'RuleAdmin',
        'RuleCreator'
    ]
}]);


annotate RuleService.checkForOverdueRules with @(requires: ['RuleAdmin']);

annotate RuleService.getApplicableRules with @(requires: [
    'RuleReader',
    'RuleAdmin',
    'RuleM2M'
]);

annotate RuleService.getAllRules with @(requires: [
    'RuleReader',
    'RuleAdmin',
    'RuleM2M'
]);
