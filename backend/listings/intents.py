"""
Intent configurations for pre-baked semantic queries.
Strategy pattern for easily adding new Bento Grid options.
"""
from listings.models import Category, TransmissionType, Governorate


# Pre-baked intent configurations
INTENT_CONFIGS = {
    'sahel_summer': {
        'name': 'Sahel Summer Vibes',
        'description': 'Perfect coastal cars for summer beach trips',
        'filters': {
            'governorate__in': [
                Governorate.ALEXANDRIA,
                Governorate.RED_SEA,
                Governorate.SOUTH_SINAI,
                Governorate.MATROUH,
                Governorate.DAMIETTA,
                Governorate.PORT_SAID,
            ],
            'vehicle__category__in': [Category.HIGH, Category.TOP, Category.PREMIUM],
        },
        'semantic_query': 'convertible luxury beach vacation coastal summer',
    },
    
    'cairo_budget': {
        'name': 'Cairo Budget Friendly',
        'description': 'Affordable cars in Cairo',
        'filters': {
            'governorate': Governorate.CAIRO,
        },
        'use_budget_percentile': True,  # Will calculate 20th percentile
        'percentile': 20,
    },
    
    'luxury_alex': {
        'name': 'Alexandria Luxury',
        'description': 'Premium cars in Alexandria',
        'filters': {
            'governorate': Governorate.ALEXANDRIA,
            'vehicle__category__in': [Category.PREMIUM, Category.TOP],
        },
        'ordering': ['-daily_price'],
    },
    
    'family_friendly': {
        'name': 'Family Friendly',
        'description': 'Spacious cars perfect for families',
        'filters': {
            'vehicle__seats__gte': 5,
            'vehicle__category__in': [Category.HIGH, Category.TOP, Category.PREMIUM],
        },
        'semantic_query': 'family spacious comfortable safe reliable',
    },
    
    'eco_friendly': {
        'name': 'Eco Friendly',
        'description': 'Electric and hybrid vehicles',
        'filters': {
            'vehicle__fuel_type__in': ['ELECTRIC', 'HYBRID'],
        },
        'semantic_query': 'eco friendly electric hybrid sustainable green',
    },
    
    'automatic_cairo': {
        'name': 'Automatic in Cairo',
        'description': 'Automatic transmission cars in Cairo',
        'filters': {
            'governorate': Governorate.CAIRO,
            'vehicle__transmission': TransmissionType.AUTOMATIC,
        },
    },
    
    'weekend_getaway': {
        'name': 'Weekend Getaway',
        'description': 'Perfect cars for weekend trips',
        'filters': {
            'vehicle__category__in': [Category.MID, Category.HIGH, Category.TOP],
        },
        'semantic_query': 'comfortable road trip adventure weekend travel',
    },
    
    'business_class': {
        'name': 'Business Class',
        'description': 'Professional cars for business needs',
        'filters': {
            'vehicle__category__in': [Category.TOP, Category.PREMIUM],
            'vehicle__transmission': TransmissionType.AUTOMATIC,
        },
        'semantic_query': 'professional business executive luxury comfortable',
    },
}


def get_intent_config(intent_id):
    """
    Get the configuration for a specific intent.
    
    Args:
        intent_id: The intent identifier
        
    Returns:
        dict: Intent configuration or None if not found
    """
    return INTENT_CONFIGS.get(intent_id)


def list_all_intents():
    """
    Get a list of all available intents with their metadata.
    
    Returns:
        list: List of intent metadata dictionaries
    """
    return [
        {
            'id': intent_id,
            'name': config['name'],
            'description': config['description'],
        }
        for intent_id, config in INTENT_CONFIGS.items()
    ]
