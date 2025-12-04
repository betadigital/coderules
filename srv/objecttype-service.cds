using {codeRules} from '../db/schema';

service ObjectTypeService @(path: '/objectTypeService') {


            @odata.draft.enabled
    entity ObjectTypes as
        projection on codeRules.ObjectType {
            *
        }
        actions {
            @Common.SideEffects: {TargetProperties: ['active']}
            action makeActive()   returns String;
            @Common.SideEffects: {TargetProperties: ['active']}
            action makeInactive() returns String;
        };


}
