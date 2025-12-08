using ObjectTypeService as service from '../../srv/objecttype-service';

annotate service.ObjectTypes with @(
    // -----------------------------------------------------------------------
    // 1. Facets and Field Groups (Object Page) - Unchanged
    // -----------------------------------------------------------------------
    UI.FieldGroup #GeneratedGroup              : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Code',
                Value: code
            },
            {
                $Type: 'UI.DataField',
                Label: 'Description',
                Value: description
            },
            {
                $Type: 'UI.DataField',
                Label: 'Active',
                Value: active
            }
        ]
    },
    UI.Facets                                  : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup'
    }],

    // -----------------------------------------------------------------------
    // 2. Line Item for INACTIVE Tab (Has "Make Active" Button)
    // -----------------------------------------------------------------------
    UI.LineItem #ListInactive                  : [
        {
            $Type: 'UI.DataField',
            Value: code,
            Label: 'Code'
        },
        {
            $Type: 'UI.DataField',
            Value: description,
            Label: 'Description'
        },
        {
            $Type: 'UI.DataField',
            Value: active,
            Label: 'Active'
        },
        {
            $Type             : 'UI.DataFieldForAction',
            Action            : 'ObjectTypeService.makeActive',
            Label             : 'Make Active',
            InvocationGrouping: #ChangeSet
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'ObjectTypeService.EntityContainer/addProgrammableType',
            Label : '{i18n>AddObjectType}',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'ObjectTypeService.makeManual',
            Label : '{i18n>MakeManual}',
        },
    ],

    // -----------------------------------------------------------------------
    // 3. Line Item for ACTIVE Tab (Has "Make Inactive" Button)
    // -----------------------------------------------------------------------
    UI.LineItem #ListActive                    : [
        {
            $Type: 'UI.DataField',
            Value: code,
            Label: 'Code'
        },
        {
            $Type: 'UI.DataField',
            Value: description,
            Label: 'Description'
        },
        {
            $Type: 'UI.DataField',
            Value: active,
            Label: 'Active'
        },
        {
            $Type             : 'UI.DataFieldForAction',
            Action            : 'ObjectTypeService.makeInactive',
            Label             : 'Make Inactive',
            InvocationGrouping: #ChangeSet
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'ObjectTypeService.EntityContainer/addProgrammableType',
            Label : '{i18n>AddObjectType}',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'ObjectTypeService.makeManual',
            Label : '{i18n>MakeManual}',
        },
    ],

    // -----------------------------------------------------------------------
    // 4. Tab 1 Configuration: Excluded (Points to #ListInactive)
    // -----------------------------------------------------------------------
    UI.SelectionPresentationVariant #tableView : {
        $Type              : 'UI.SelectionPresentationVariantType',
        Text               : 'Excluded Object Types',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem#ListInactive'] // <--- Updated
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [{
                PropertyName: active,
                Ranges      : [{
                    Sign  : #I,
                    Option: #EQ,
                    Low   : false
                }]
            }]
        }
    },

    // -----------------------------------------------------------------------
    // 5. Tab 2 Configuration: Active (Points to #ListActive)
    // -----------------------------------------------------------------------
    UI.SelectionPresentationVariant #tableView1: {
        $Type              : 'UI.SelectionPresentationVariantType',
        Text               : 'Active Object Types',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem#ListActive'] // <--- Updated
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [{
                PropertyName: active,
                Ranges      : [{
                    Sign  : #I,
                    Option: #EQ,
                    Low   : true
                }]
            }]
        }
    }
);
