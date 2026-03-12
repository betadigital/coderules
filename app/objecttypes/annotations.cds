using ObjectTypeService as service from '../../srv/objecttype-service';

annotate service.ObjectTypes with @(
    // -----------------------------------------------------------------------
    // 1. Facets and Field Groups (Object Page) - Unchanged
    // -----------------------------------------------------------------------
    UI.FieldGroup #GeneratedGroup             : {
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
    UI.Facets                                 : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup'
    }],

    // -----------------------------------------------------------------------
    // 2. Line Item for INACTIVE Tab (Has "Make Active" Button)
    // -----------------------------------------------------------------------
    UI.LineItem #ListInactive                 : [
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
            $Type : 'UI.DataFieldForAction',
            Action: 'ObjectTypeService.toggle',
            Label : '{i18n>ToggleExclusion}',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'ObjectTypeService.makeManual',
            Label : '{i18n>MarkAsManualReview}',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'ObjectTypeService.EntityContainer/addProgrammableType',
            Label : '{i18n>AddObjectType}',
        },
        {
            $Type : 'UI.DataField',
            Value : isExcluded,
        },
    ],

    // -----------------------------------------------------------------------
    // 4. Tab 1 Configuration: Excluded (Points to #ListInactive)
    // -----------------------------------------------------------------------
    UI.SelectionPresentationVariant #tableView: {
        $Type              : 'UI.SelectionPresentationVariantType',
        Text               : '{i18n>ObjectTypes}',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem#ListInactive'], // <--- Updated
            SortOrder     : [{
                $Type     : 'Common.SortOrderType',
                Property  : active,
                Descending: false,
            }, ],
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: []
        }
    }
);
