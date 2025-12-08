using {ObjectTypeService} from './objecttype-service';

annotate ObjectTypeService with @(restrict: [
    {
        grant: '*',
        to   : 'Admin'
    },
    {
        grant: ['READ'],
        to   : [
            'RuleM2M',
            'RuleReader'
        ]
    }
]);
