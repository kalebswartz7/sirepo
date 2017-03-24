'use strict';

var srlog = SIREPO.srlog;
var srdbg = SIREPO.srdbg;

SIREPO.appLocalRoutes.lattice = '/lattice/:simulationId';
SIREPO.appLocalRoutes.visualization = '/visualization/:simulationId';
SIREPO.PLOTTING_SUMMED_LINEOUTS = true;

SIREPO.app.config(function($routeProvider, localRoutesProvider) {
    if (SIREPO.IS_LOGGED_OUT) {
        return;
    }
    var localRoutes = localRoutesProvider.$get();
    $routeProvider
        .when(localRoutes.source, {
            controller: 'Hellweg2DSourceController as source',
            templateUrl: '/static/html/hellweg2d-source.html' + SIREPO.SOURCE_CACHE_KEY,
        })
        .when(localRoutes.lattice, {
            controller: 'Hellweg2DLatticeController as lattice',
            templateUrl: '/static/html/hellweg2d-lattice.html' + SIREPO.SOURCE_CACHE_KEY,
        })
        .when(localRoutes.visualization, {
            controller: 'Hellweg2DVisualizationController as visualization',
            templateUrl: '/static/html/hellweg2d-visualization.html' + SIREPO.SOURCE_CACHE_KEY,
        });
});

SIREPO.app.controller('Hellweg2DLatticeController', function (appState, panelState, $scope) {
    var self = this;
});

SIREPO.app.controller('Hellweg2DSourceController', function (appState, panelState, $scope) {
    var self = this;

    function updateAllFields() {
        updateBeamFields();
        updateSolenoidFields();
    }

    function updateBeamFields() {
        var beam = appState.models.beam;
        panelState.showTab('beam', 2, beam.transversalDistribution == 'twiss4d');
        panelState.showTab('beam', 3, beam.transversalDistribution == 'sph2d');
        panelState.showTab('beam', 4, beam.transversalDistribution == 'ell2d');
        panelState.showField('sphericalDistribution', 'curvatureFactor', beam.transversalDistribution == 'sph2d' && appState.models.sphericalDistribution.curvature != 'flat');
        ['energyDeviation', 'phaseDeviation'].forEach(function(f) {
            panelState.showField('energyPhaseDistribution', f, beam.longitudinalDistribution == 'norm2d' && appState.models.energyPhaseDistribution.distributionType == 'gaussian');
        });
    }

    function updateSolenoidFields() {
        var solenoid = appState.models.solenoid;
        ['fieldStrength', 'length', 'z0', 'fringeRegion'].forEach(function(f) {
            panelState.showField('solenoid', f, solenoid.sourceDefinition == 'values');
        });
    }

    self.handleModalShown = function(name) {
        updateAllFields();
    };

    appState.watchModelFields($scope, ['beam.transversalDistribution', 'sphericalDistribution.curvature', 'energyPhaseDistribution.distributionType'], updateBeamFields);
    appState.watchModelFields($scope, ['solenoid.sourceDefinition'], updateSolenoidFields);
    appState.whenModelsLoaded($scope, updateAllFields);
});

SIREPO.app.controller('Hellweg2DVisualizationController', function (appState, panelState, $scope) {
    var self = this;
});

SIREPO.app.directive('appHeader', function(appState, panelState) {
    return {
        restirct: 'A',
        scope: {
            nav: '=appHeader',
        },
        template: [
            '<div class="navbar-header">',
              '<a class="navbar-brand" href="/#about"><img style="width: 40px; margin-top: -10px;" src="/static/img/radtrack.gif" alt="radiasoft"></a>',
              '<div class="navbar-brand"><a href data-ng-click="nav.openSection(\'simulations\')">Hellweg2D</a></div>',
            '</div>',
            '<div data-app-header-left="nav"></div>',
            '<ul class="nav navbar-nav navbar-right" data-login-menu=""></ul>',
            '<ul class="nav navbar-nav navbar-right" data-ng-show="isLoaded()">',
              '<li data-ng-class="{active: nav.isActive(\'source\')}"><a href data-ng-click="nav.openSection(\'source\')"><span class="glyphicon glyphicon-flash"></span> Source</a></li>',
              '<li data-ng-class="{active: nav.isActive(\'lattice\')}"><a href data-ng-click="nav.openSection(\'lattice\')"><span class="glyphicon glyphicon-option-horizontal"></span> Lattice</a></li>',
              '<li data-ng-if="hasLattice()" data-ng-class="{active: nav.isActive(\'visualization\')}"><a data-ng-href="{{ nav.sectionURL(\'visualization\') }}"><span class="glyphicon glyphicon-picture"></span> Visualization</a></li>',
            '</ul>',
            '<ul class="nav navbar-nav navbar-right" data-ng-show="nav.isActive(\'simulations\')">',
              '<li><a href data-ng-click="showSimulationModal()"><span class="glyphicon glyphicon-plus sr-small-icon"></span><span class="glyphicon glyphicon-file"></span> New Simulation</a></li>',
              '<li><a href data-ng-click="showNewFolderModal()"><span class="glyphicon glyphicon-plus sr-small-icon"></span><span class="glyphicon glyphicon-folder-close"></span> New Folder</a></li>',
            '</ul>',
        ].join(''),
        controller: function($scope) {
            $scope.hasLattice = function() {
                return appState.isLoaded();
            };
            $scope.isLoaded = function() {
                if ($scope.nav.isActive('simulations'))
                    return false;
                return appState.isLoaded();
            };
            $scope.showNewFolderModal = function() {
                panelState.showModalEditor('simulationFolder');
            };
            $scope.showSimulationModal = function() {
                panelState.showModalEditor('simulation');
            };
        },
    };
});
