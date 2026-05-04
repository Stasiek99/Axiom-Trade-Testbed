import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AlpacaService } from './alpaca.service';
import { Bar } from '../models/bar.model';

const MOCK_BAR_1 = { t: '2024-01-15T10:00:00Z', o: 2200, h: 2250, l: 2190, c: 2230, v: 150 };
const MOCK_BAR_2 = { t: '2024-01-16T10:00:00Z', o: 2300, h: 2350, l: 2290, c: 2330, v: 200 };

const mockResponse = (bars: any[], symbol = 'ETH/USD') => ({
  bars: { [symbol]: bars },
  next_page_token: null,
});

describe('AlpacaService', () => {
  let service: AlpacaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AlpacaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('maps Alpaca response to Bar[] correctly', () => {
    service.getCryptoBars('ETH/USD', '1Hour', 5).subscribe((bars: Bar[]) => {
      expect(bars.length).toBe(1);
      expect(bars[0].time).toBe(Math.floor(new Date(MOCK_BAR_1.t).getTime() / 1000));
      expect(bars[0].open).toBe(2200);
      expect(bars[0].high).toBe(2250);
      expect(bars[0].low).toBe(2190);
      expect(bars[0].close).toBe(2230);
    });

    httpMock.expectOne(r => r.url.includes('/v1beta3/crypto/us/bars'))
      .flush(mockResponse([MOCK_BAR_1]));
  });

  it('sorts bars ascending by time', () => {
    service.getCryptoBars('ETH/USD', '1Hour').subscribe(bars => {
      expect(bars[0].time).toBe(Math.floor(new Date(MOCK_BAR_1.t).getTime() / 1000));
      expect(bars[1].time).toBe(Math.floor(new Date(MOCK_BAR_2.t).getTime() / 1000));
    });

    httpMock.expectOne(r => r.url.includes('/v1beta3/crypto/us/bars'))
      .flush(mockResponse([MOCK_BAR_2, MOCK_BAR_1]));
  });

  it('returns empty array when symbol has no bars in response', () => {
    service.getCryptoBars('ETH/USD', '1Hour').subscribe(bars => {
      expect(bars).toEqual([]);
    });

    httpMock.expectOne(r => r.url.includes('/v1beta3/crypto/us/bars'))
      .flush({ bars: {}, next_page_token: null });
  });

  it('swallows HTTP errors and emits nothing', () => {
    const spy = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    service.getCryptoBars('ETH/USD', '1Hour').subscribe({ next: spy });

    httpMock.expectOne(r => r.url.includes('/v1beta3/crypto/us/bars'))
      .flush('error', { status: 500, statusText: 'Server Error' });

    expect(spy).not.toHaveBeenCalled();
  });

  it('sends correct query params', () => {
    service.getCryptoBars('BTC/USD', '1Day', 100).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/v1beta3/crypto/us/bars'));
    expect(req.request.params.get('symbols')).toBe('BTC/USD');
    expect(req.request.params.get('timeframe')).toBe('1Day');
    expect(req.request.params.get('limit')).toBe('100');
    req.flush(mockResponse([], 'BTC/USD'));
  });
});
