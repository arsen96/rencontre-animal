import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Subject, Subscription, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
} from 'rxjs/operators';
import { CitySelection, CitySuggestion } from '../../../core/interfaces/city-selection.interface';
import { GeoPoint } from '../../../core/interfaces/user.interface';
import { CityGeocodingService } from '../../../core/services/city-geocoding.service';

@Component({
  selector: 'app-city-autocomplete',
  templateUrl: './city-autocomplete.component.html',
  styleUrls: ['./city-autocomplete.component.scss'],
  standalone: false,
})
export class CityAutocompleteComponent implements OnInit, OnChanges, OnDestroy {
  @Input() city = '';
  @Input() location?: GeoPoint;
  @Input() placeholder = '';
  @Input() showHint = true;
  @Output() selectionChange = new EventEmitter<CitySelection | null>();

  query = '';
  suggestions: CitySuggestion[] = [];
  showSuggestions = false;
  loading = false;
  hasValidSelection = false;
  selectionHint = false;

  private readonly search$ = new Subject<string>();
  private searchSub?: Subscription;

  constructor(private readonly geocoding: CityGeocodingService) {}

  ngOnInit(): void {
    this.syncFromInputs();

    this.searchSub = this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          if (value.trim().length < 2) {
            this.loading = false;
            return of([]);
          }

          this.loading = true;
          return this.geocoding
            .searchMunicipalities(value)
            .pipe(finalize(() => (this.loading = false)));
        })
      )
      .subscribe((results) => {
        this.suggestions = results;
        this.showSuggestions = results.length > 0;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['city'] || changes['location']) {
      this.syncFromInputs();
    }
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onInput(value: string): void {
    this.query = value;
    this.selectionHint = false;

    if (this.hasValidSelection && value.trim() !== this.city.trim()) {
      this.hasValidSelection = false;
      this.selectionChange.emit(null);
    }

    this.search$.next(value);
  }

  onFocus(): void {
    if (this.suggestions.length > 0) {
      this.showSuggestions = true;
      return;
    }

    if (this.query.trim().length >= 2) {
      this.search$.next(this.query);
    }
  }

  onBlur(): void {
    window.setTimeout(() => {
      this.showSuggestions = false;
    }, 180);
  }

  selectSuggestion(suggestion: CitySuggestion): void {
    this.query = suggestion.city;
    this.city = suggestion.city;
    this.location = suggestion.location;
    this.hasValidSelection = true;
    this.selectionHint = false;
    this.showSuggestions = false;
    this.suggestions = [];
    this.selectionChange.emit({
      city: suggestion.city,
      location: suggestion.location,
    });
  }

  markSelectionRequired(): boolean {
    if (this.hasValidSelection) {
      return true;
    }

    this.selectionHint = true;
    return false;
  }

  private syncFromInputs(): void {
    this.query = this.city;
    this.hasValidSelection = !!(this.city.trim() && this.location);
  }
}
