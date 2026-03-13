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
            Label: '{i18n>ObjectType}'
        },
        {
            $Type: 'UI.DataField',
            Value: description,
            Label: 'Description'
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'ObjectTypeService.EntityContainer/addProgrammableType',
            Label : '{i18n>AddObjectType}',
        },
        {
            $Type : 'UI.DataField',
            Value : active,
            Label : '{i18n>Active}',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'ObjectTypeService.makeInactive',
            Label : '{i18n>MakeInactive}',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'ObjectTypeService.makeActive',
            Label : '{i18n>MakeActive1}',
        },
    ],

    // -----------------------------------------------------------------------
    // 4. Tab 1 Configuration: Excluded (Points to #ListInactive)
    // -----------------------------------------------------------------------
    UI.SelectionPresentationVariant #tableView: {
        $Type              : 'UI.SelectionPresentationVariantType',
        Text               : '{i18n>ExcludedObjectTypes}',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem#ListInactive'], // <--- Updated
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [
                {
                    $Type : 'UI.SelectOptionType',
                    PropertyName : excluded,
                    Ranges : [
                        {
                            Sign : #I,
                            Option : #EQ,
                            Low : true,
                        },
                    ],
                },
            ]
        }
    },
    UI.LineItem #tableView : [
        {
            $Type : 'UI.DataField',
            Value : code,
            Label : '{i18n>ObjectType}',
        },
        {
            $Type : 'UI.DataField',
            Value : description,
            Label : '{i18n>Description}',
        },
        {
            $Type : 'UI.DataField',
            Value : active,
            Label : '{i18n>IsActive}',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'ObjectTypeService.makeActive',
            Label : '{i18n>MakeActive}',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'ObjectTypeService.makeInactive',
            Label : '{i18n>MakeInactive}',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'ObjectTypeService.EntityContainer/addProgrammableType',
            Label : '{i18n>AddObjectType}',
        },
    ],
    UI.SelectionPresentationVariant #tableView1 : {
        $Type : 'UI.SelectionPresentationVariantType',
        PresentationVariant : {
            $Type : 'UI.PresentationVariantType',
            Visualizations : [
                '@UI.LineItem#tableView',
            ],
        },
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : [
                {
                    $Type : 'UI.SelectOptionType',
                    PropertyName : excluded,
                    Ranges : [
                        {
                            Sign : #I,
                            Option : #EQ,
                            Low : false,
                        },
                    ],
                },
            ],
        },
        Text : '{i18n>IncludedObjectTypes}',
    },
);
annotate service.ExcludedObjectTypes with @(
    UI.LineItem #tableView : [
        {
            $Type : 'UI.DataField',
            Value : code,
            Label : '{i18n>Code1}',
        },
        {
            $Type : 'UI.DataField',
            Value : description,
            Label : '{i18n>Description}',
        },
        {
            $Type : 'UI.DataField',
            Value : manual,
            Label : '{i18n>Manual}',
        },
    ],
    UI.SelectionPresentationVariant #tableView : {
        $Type : 'UI.SelectionPresentationVariantType',
        PresentationVariant : {
            $Type : 'UI.PresentationVariantType',
            Visualizations : [
                '@UI.LineItem#tableView',
            ],
        },
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : [
            ],
        },
        Text : '{i18n>AllExcludedObjectTypes}',
    },
);

