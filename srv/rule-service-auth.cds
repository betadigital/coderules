using {RuleService} from './rule-service';

annotate RuleService.AutomationLogs with @(restrict: [
    {
        grant: '*',
        to   : 'Admin'
    },
    {
        grant: [
            'UPDATE',
            'CREATE',
            'READ'
        ],
        to   : ['RuleM2M']
    },
    {
        grant: ['READ'],
        to   : [
            'authenticated-user',
            'RuleReader'
        ]
    }
]);


annotate RuleService.CodeUsers with @(restrict: [
    {
        grant: '*',
        to   : 'RuleAdmin'
    },
    {
        grant: 'applyAllRules',
        to   : [
            'RuleM2M',
            'RuleAdmin'
        ]
    },
    {
        grant: 'CREATE',
        to   : [
            'RuleM2M'
        ]
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
