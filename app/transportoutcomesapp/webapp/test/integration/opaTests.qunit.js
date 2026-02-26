sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'transportoutcomesapp/test/integration/FirstJourney',
		'transportoutcomesapp/test/integration/pages/TransportOutcomesList',
		'transportoutcomesapp/test/integration/pages/TransportOutcomesObjectPage'
    ],
    function(JourneyRunner, opaJourney, TransportOutcomesList, TransportOutcomesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('transportoutcomesapp') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheTransportOutcomesList: TransportOutcomesList,
					onTheTransportOutcomesObjectPage: TransportOutcomesObjectPage
                }
            },
            opaJourney.run
        );
    }
);