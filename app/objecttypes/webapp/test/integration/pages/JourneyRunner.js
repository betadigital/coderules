sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"objecttypes/test/integration/pages/ObjectTypesList",
	"objecttypes/test/integration/pages/ObjectTypesObjectPage"
], function (JourneyRunner, ObjectTypesList, ObjectTypesObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('objecttypes') + '/test/flp.html#app-preview',
        pages: {
			onTheObjectTypesList: ObjectTypesList,
			onTheObjectTypesObjectPage: ObjectTypesObjectPage
        },
        async: true
    });

    return runner;
});

