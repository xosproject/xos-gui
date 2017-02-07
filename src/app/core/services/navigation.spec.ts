import * as angular from 'angular';
import 'angular-mocks';
import 'angular-ui-router';
import {xosCore} from '../index';
import {IXosNavigationService, IXosNavigationRoute} from './navigation';

let service: IXosNavigationService, $log: ng.ILogService;

let defaultRoutes: IXosNavigationRoute[];

const mockRoutes = [
  {
    label: 'Slices',
    state: 'xos.core.slices'
  },
  {
    label: 'Instances',
    state: 'xos.core.instances'
  },
  {
    label: 'Nodes',
    state: 'xos.core.nodes'
  }
];

describe('The Navigation service', () => {

  beforeEach(() => {
    angular.module(xosCore)
      .value('StyleConfig', {
        routes: mockRoutes
      });

    angular.mock.module(xosCore);
  });

  beforeEach(angular.mock.inject((
    NavigationService: IXosNavigationService,
    _$log_: ng.ILogService
  ) => {
    service = NavigationService;
    $log = _$log_;
    spyOn($log, 'warn');
    defaultRoutes = [
      {
        label: 'Home',
        state: 'xos.dashboard'
      },
      {
        label: 'Core',
        state: 'xos.core'
      }
    ].concat(mockRoutes);
  }));

  it('should return navigation routes', () => {
    expect(service.query()).toEqual(defaultRoutes);
  });

  it('should add a route', () => {
    const testRoutes: IXosNavigationRoute[] = [
      {label: 'TestState', state: 'xos.test'},
      {label: 'TestUrl', url: 'test'}
    ];
    service.add(testRoutes[0]);
    service.add(testRoutes[1]);
    expect($log.warn).not.toHaveBeenCalled();
    const serviceRoutes = service.query();
    expect(serviceRoutes).toEqual(defaultRoutes.concat(testRoutes));
  });

  it('should add a child route', () => {
    const testRoute: IXosNavigationRoute = {
      label: 'TestState', state: 'xos.test', parent: 'xos.core'
    };
    service.add(testRoute);
    defaultRoutes[1].children = [testRoute];
    expect(service.query()).toEqual(defaultRoutes);
  });

  it('should not add route that have both url and state', () => {
    function wrapper() {
      service.add({
        label: 'Fail',
        url: 'f',
        state: 'f'
      });
    }
    expect(wrapper).toThrowError('[XosNavigation] You can\'t provide both state and url');
  });

  it('should not add route that already exist', () => {
    const testRoute: IXosNavigationRoute = {label: 'TestState', state: 'xos.test'};
    service.add(testRoute);
    service.add(testRoute);
    expect($log.warn).toHaveBeenCalled();
    expect($log.warn).toHaveBeenCalledWith(`[XosNavigation] Route with label: ${testRoute.label}, state: ${testRoute.state} and parent: ${testRoute.parent} already exist`);
    expect(service.query()).toEqual(defaultRoutes.concat([testRoute]));
  });
});
