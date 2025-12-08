using {codeRules} from '../db/schema';

service ObjectTypeService @(path: '/objectTypeService') {


    // -------------------------------------------------------------------------
    // 1. Manual Object Types (The "Pool")
    // -------------------------------------------------------------------------
    // These are the existing, static types loaded from the CSV.
    // They act as the source list for the dropdown.
    @readonly
    @Capabilities : { Insertable: false, Deletable: false, Updatable: false }
    entity ManualObjectTypes as projection on codeRules.ObjectType {
        key code,
        description,
        programId,
        manual,
        active
    } where manual = true;

    // -------------------------------------------------------------------------
    // 2. Programmable Object Types (The "Active" List)
    // -------------------------------------------------------------------------
    // Users manage these. We disable standard 'Insertable' because we don't 
    // want users typing in random codes; they must use the action below.
    @odata.draft.enabled
    @Capabilities : { Insertable: false, Deletable : false, } 
    entity ObjectTypes as projection on codeRules.ObjectType {
        *
    } where manual = false;

    // Actions specific to Programmable Types (Active/Inactive Toggle)
    extend entity ObjectTypes with actions {
        @Common.SideEffects: {TargetProperties: ['active']}
        action makeActive()   returns ObjectTypes;

        @Common.SideEffects: {TargetProperties: ['active']}
        action makeInactive() returns ObjectTypes;

        @Common.SideEffects : { 
            TargetEntities : ['ObjectTypes', 'ManualObjectTypes'] 
        }
        action makeManual() returns ObjectTypes;
    };

    // -------------------------------------------------------------------------
    // 3. Creation Override: "Add from Manual List"
    // -------------------------------------------------------------------------
    // This action replaces the standard Create. It takes a 'code' parameter
    // which offers a dropdown (ValueList) from the ManualObjectTypes entity.
    action addProgrammableType (
        @Common.Label : 'Select Object Type'
        @Common.ValueList : {
            Label : 'Select from Manual Types',
            CollectionPath : 'ManualObjectTypes',
            Parameters : [
                { $Type : 'Common.ValueListParameterInOut', LocalDataProperty : code, ValueListProperty : 'code' },
                { $Type : 'Common.ValueListParameterDisplayOnly', ValueListProperty : 'description' }
            ]
        }
        code : codeRules.ObjectType:code
    ) returns ObjectTypes;

}

// -----------------------------------------------------------------------------
// Side Effects for Unbound Action 
// -----------------------------------------------------------------------------
annotate ObjectTypeService.addProgrammableType with @Common.SideEffects : {
    TargetEntities : [
        ObjectTypeService.ObjectTypes, 
        ObjectTypeService.ManualObjectTypes
    ]
};