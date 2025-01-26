var patientDetailFieldMap = {
    "basic_detail": [
        {
            "attribute": "id",
            "type": "integer",
        },
        {
            "attribute": "name",
            "type": "string",
            "display": "Patient Name"
        },
        {
            "attribute": "age",
            "type": "integer"
        },
        {
            "attribute": "phone",
            "type": "string"
        },
        {
            "attribute": "bed_number",
            "type": "string"
        },
        {
            "attribute": "guardian_relation",
            "type": "string"
        },
        {
            "attribute": "guardian_name",
            "type": "string"
        },
        {
            "attribute": "ipd_registration_number",
            "type": "string",
            "display": "IPD Registration Number"
        },
        {
            "attribute": "opd_registration_number",
            "type": "string"
        },
        {
            "attribute": "aadhaar_number",
            "type": "string"
        },
        {
            "attribute": "address",
            "type": "string"
        },
        {
            "attribute": "bpl",
            "type": "string"
        },
        {
            "attribute": "last_update_time",
            "type": "datetime"
        },
        {
            "attribute": "current_status",
            "type": "string"
        },
        {
            "attribute": "place_id",
            "type": "integer"
        },
        {
            "attribute": "first_cervix_diameter",
            "type": "string"
        },
        {
            "attribute": "last_cervix_diameter",
            "type": "string"
        },
        {
            "attribute": "last_cervix_diameter_time",
            "type": "datetime"
        },
        {
            "attribute": "register_time",
            "type": "datetime"
        },
        {
            "attribute": "marital_status",
            "type": "string"
        },
        {
            "attribute": "birth_companion",
            "type": "string"
        },
        {
            "attribute": "mcts_number",
            "type": "string"
        },
        {
            "attribute": "booked",
            "type": "string"
        },
        {
            "attribute": "asha",
            "type": "string"
        }
    ],
    "labor_data": [
        {
            "attribute": "data_type",
            "type": "string"
        },
        {
            "attribute": "data_time",
            "type": "datetime"
        },
        {
            "attribute": "param_1",
            "type": "string"
        },
        {
            "attribute": "param_2",
            "type": "string"
        },
        {
            "attribute": "param_3",
            "type": "string"
        }

    ],
    "alerts": [
        {
            "attribute": "data_time",
            "type": "datetime"
        },
        {
            "attribute": "alert_type",
            "type": "string"
        },
        {
            "attribute": "alert_message",
            "type": "string"
        }
    ],
    "mother_post_labor_data": [
        {
            "attribute": "data_type",
            "type": "string"
        },
        {
            "attribute": "data_time",
            "type": "datetime"
        },
        {
            "attribute": "param_1",
            "type": "string",
            "display": "Data Value"
        }
    ],
    "child_post_labor_data": [
        {
            "attribute": "data_type",
            "type": "string"
        },
        {
            "attribute": "data_time",
            "type": "datetime"
        },
        {
            "attribute": "param_1",
            "type": "string",
            "display": "Data Value"
        }
    ],
    "place_details": [
        {
            "attribute": "name",
            "type": "string",
            "display": "Facility Name"
        }
    ],
    "investigation": [
        {
            "attribute": "blood_group",
            "type": "string"
        },
        {
            "attribute": "haemoglobin",
            "type": "string"
        },
        {
            "attribute": "vdrl_rpr",
            "type": "string"
        },
        {
            "attribute": "hbs_ag",
            "type": "string"
        },
        {
            "attribute": "urine_albumin",
            "type": "string"
        },
        {
            "attribute": "urine_sugar",
            "type": "string"
        },
        {
            "attribute": "rbs",
            "type": "string"
        },
        {
            "attribute": "hiv",
            "type": "string"
        },
        {
            "attribute": "pph",
            "type": "string"
        },
        {
            "attribute": "action_taken",
            "type": "string"
        },
        {
            "attribute": "action_taken_other",
            "type": "string"
        },
        {
            "attribute": "staff_nurse_feedback",
            "type": "string"
        },
        {
            "attribute": "syphilis",
            "type": "string"
        },
        {
            "attribute": "malaria",
            "type": "string"
        },
        {
            "attribute": "anti_d",
            "type": "string"
        }
    ],
    "covid_note": [
        {
            "attribute": "patient_risk",
            "type": "enum",
            "mapping": {
                "low_risk": "Low Risk",
                "high_risk": "High Risk",
                "moderate_risk": "Moderate Risk"
            }
        },
        {
            "attribute": "patient_fever",
            "type": "string"
        },
        {
            "attribute": "patient_cough",
            "type": "string"
        },
        {
            "attribute": "patient_breathing_difficulty",
            "type": "string"
        },
        {
            "attribute": "patient_travel_within_two_weeks",
            "type": "string"
        },
        {
            "attribute": "patient_loss_of_taste_smell",
            "type": "string"
        },
        {
            "attribute": "patient_sore_throat",
            "type": "string"
        },
        {
            "attribute": "patient_last_travel_start",
            "type": "date"
        },
        {
            "attribute": "patient_last_travel_end",
            "type": "date"
        },
        {
            "attribute": "patient_notes",
            "type": "string"
        },
        {
            "attribute": "patient_containment_zone",
            "type": "string"
        },
        {
            "attribute": "patient_edd_next_15_days",
            "type": "string"
        },
        {
            "attribute": "patient_immunity_affecting_medicine",
            "type": "string"
        },
        {
            "attribute": "patient_covid_area_travel",
            "type": "string"
        },
        {
            "attribute": "patient_covid_person_contact",
            "type": "string"
        },
        {
            "attribute": "patient_covid_person_belonging_contact",
            "type": "string"
        },
        {
            "attribute": "patient_covid_sample_taken",
            "type": "string"
        },
        {
            "attribute": "household_fever",
            "type": "string"
        },
        {
            "attribute": "household_cough",
            "type": "string"
        },
        {
            "attribute": "household_breathing_difficulty",
            "type": "string"
        },
        {
            "attribute": "household_loss_of_taste_smell",
            "type": "string"
        },
        {
            "attribute": "household_sore_throat",
            "type": "string"
        },
        {
            "attribute": "household_travel_within_two_weeks",
            "type": "string"
        },
        {
            "attribute": "household_last_travel_start",
            "type": "date"
        },
        {
            "attribute": "household_last_travel_end",
            "type": "date"
        },
        {
            "attribute": "household_covid_case",
            "type": "string"
        },
        {
            "attribute": "household_notes",
            "type": "string"
        }
    ],
    "physical_examination": [
        {
            "attribute": "height",
            "type": "string"
        },
        {
            "attribute": "weight",
            "type": "string"
        },
        {
            "attribute": "pallor",
            "type": "string"
        },
        {
            "attribute": "jaundice",
            "type": "string"
        },
        {
            "attribute": "pedal_edema",
            "type": "string"
        },
        {
            "attribute": "breast",
            "type": "string"
        },
        {
            "attribute": "heart",
            "type": "string"
        },
        {
            "attribute": "lungs",
            "type": "string"
        }
    ],
    "pa_pv_examination": [
        {
            "attribute": "gestation_type",
            "type": "string"
        },
        {
            "attribute": "gestation_period",
            "type": "string"
        },
        {
            "attribute": "fundal_height",
            "type": "string"
        },
        {
            "attribute": "presentation",
            "type": "string"
        },
        {
            "attribute": "presenting_part",
            "type": "string"
        },
        {
            "attribute": "presenting_part_other",
            "type": "string"
        },
        {
            "attribute": "fetal_movements",
            "type": "string"
        },
        {
            "attribute": "pelvic_adequacy",
            "type": "string"
        }
    ],
    "admission_note": [
        {
            "attribute": "chief_complaints",
            "type": "string"
        },
        {
            "attribute": "chief_complaints_other",
            "type": "string"
        },
        {
            "attribute": "lmp",
            "type": "date"
        },
        {
            "attribute": "edd",
            "type": "date"
        },
        {
            "attribute": "gravida",
            "type": "string"
        },
        {
            "attribute": "para",
            "type": "string"
        },
        {
            "attribute": "living_children",
            "type": "string"
        },
        {
            "attribute": "abortion",
            "type": "string"
        }
    ],
    "treatment_detail": [
        {
            "attribute": "tt",
            "type": "string"
        },
        {
            "attribute": "ifa_taken",
            "type": "string"
        },
        {
            "attribute": "calcium_taken",
            "type": "string"
        },
        {
            "attribute": "other_drug",
            "type": "string"
        },
        {
            "attribute": "other_drug_detail",
            "type": "string"
        },
        {
            "attribute": "antenatal_steroid",
            "type": "string"
        }
    ],
    "mother_child_notes": [],
    "obstetric_histories": [
        {
            "attribute": "pregnancy_no",
            "type": "integer"
        },
        {
            "attribute": "pregnancy_year",
            "type": "string"
        },
        {
            "attribute": "pregnancy_complication",
            "type": "string"
        },
        {
            "attribute": "complication_reason",
            "type": "string"
        },
        {
            "attribute": "complication_reason_other",
            "type": "string"
        },
        {
            "attribute": "delivery_place",
            "type": "string"
        },
        {
            "attribute": "delivery_place_other",
            "type": "string"
        },
        {
            "attribute": "delivery_mode",
            "type": "string"
        },
        {
            "attribute": "delivery_mode_other",
            "type": "string"
        },
        {
            "attribute": "delivery_outcome",
            "type": "string"
        },
        {
            "attribute": "gestational_age",
            "type": "string"
        },
        {
            "attribute": "no_of_children",
            "type": "string"
        },
        {
            "attribute": "child_weights",
            "type": "string"
        },
        {
            "attribute": "child_genders",
            "type": "string"
        },
        {
            "attribute": "notes",
            "type": "string"
        }
    ],
    "medical_history": [
        {
            "attribute": "hypertension",
            "type": "string"
        },
        {
            "attribute": "diabetese_mellitus",
            "type": "string"
        },
        {
            "attribute": "tuberculosis",
            "type": "string"
        },
        {
            "attribute": "bronchial_asthma",
            "type": "string"
        },
        {
            "attribute": "heart_disease",
            "type": "string"
        },
        {
            "attribute": "other_medical_condition",
            "type": "string"
        },
        {
            "attribute": "other_medical_condition_details",
            "type": "string"
        },
        {
            "attribute": "surgery_done",
            "type": "string"
        },
        {
            "attribute": "surgery_detail",
            "type": "string"
        },
        {
            "attribute": "drug_allergy",
            "type": "string"
        },
        {
            "attribute": "drug_allergy_details",
            "type": "string"
        },
        {
            "attribute": "contraceptive",
            "type": "string"
        }
    ],
    "family_history": [
        {
            "attribute": "hypertension",
            "type": "string"
        },
        {
            "attribute": "diabetese_mellitus",
            "type": "string"
        },
        {
            "attribute": "tuberculosis",
            "type": "string"
        },
        {
            "attribute": "asthma",
            "type": "string"
        },
        {
            "attribute": "heart_disease",
            "type": "string"
        },
        {
            "attribute": "other_medical_condition",
            "type": "string"
        },
        {
            "attribute": "other_medical_condition_details",
            "type": "string"
        },
        {
            "attribute": "twins",
            "type": "string"
        },
        {
            "attribute": "premature_membrane_rupture",
            "type": "string"
        }
    ],
    "delivery_detail": [
        {
            "attribute": "delivery_doctor_id",
            "type": "integer"
        },
        {
            "attribute": "delivery_type",
            "type": "string"
        },
        {
            "attribute": "delivery_type_other",
            "type": "string"
        },
        {
            "attribute": "delivery_hospital_type",
            "type": "string"
        },
        {
            "attribute": "mother_status",
            "type": "string"
        },
        {
            "attribute": "death_time",
            "type": "datetime"
        },
        {
            "attribute": "death_cause",
            "type": "string"
        },
        {
            "attribute": "death_cause_other",
            "type": "string"
        },
        {
            "attribute": "post_delivery_death",
            "type": "boolean"
        },
        {
            "attribute": "no_of_children",
            "type": "string"
        },
        {
            "attribute": "complications",
            "type": "string"
        },
        {
            "attribute": "remarks",
            "type": "string"
        },
        {
            "attribute": "third_stage_active_management",
            "type": "string"
        },
        {
            "attribute": "episiotomy_done",
            "type": "string"
        },
        {
            "attribute": "delayed_cord_clamping",
            "type": "string"
        },
        {
            "attribute": "placenta_delivered",
            "type": "string"
        },
        {
            "attribute": "placenta_weight_1",
            "type": "string"
        },
        {
            "attribute": "placenta_weight_2",
            "type": "string"
        },
        {
            "attribute": "completeness_checked",
            "type": "string"
        },
        {
            "attribute": "blood_loss_estimation",
            "type": "string"
        },
        {
            "attribute": "placenta_delivered_observation",
            "type": "string"
        },
        {
            "attribute": "perineun_tear",
            "type": "string"
        },
        {
            "attribute": "repair",
            "type": "string"
        },
        {
            "attribute": "ppiucd_counselling",
            "type": "string"
        },
        {
            "attribute": "cct",
            "type": "string"
        },
        {
            "attribute": "uterine_massage",
            "type": "string"
        },
        {
            "attribute": "oxytocin",
            "type": "string"
        },
        {
            "attribute": "misoprostol",
            "type": "string"
        },
        {
            "attribute": "counselling_on_danger_sign",
            "type": "string"
        },
        {
            "attribute": "family_planning_method",
            "type": "string"
        },
        {
            "attribute": "family_planning_method_other",
            "type": "string"
        },
        {
            "attribute": "pushing_done",
            "type": "string"
        },
        {
            "attribute": "assist_provided",
            "type": "string"
        },
        {
            "attribute": "labor_type",
            "type": "string"
        },
        {
            "attribute": "robson_classification",
            "type": "string"
        }
    ],
    "pre_delivery_checklist": [
        {
            "attribute": "spotlight",
            "type": "string"
        },
        {
            "attribute": "glove",
            "type": "string"
        },
        {
            "attribute": "soap_and_water",
            "type": "string"
        },
        {
            "attribute": "oxytocin_syringe",
            "type": "string"
        },
        {
            "attribute": "sanity_pad",
            "type": "string"
        },
        {
            "attribute": "towel",
            "type": "string"
        },
        {
            "attribute": "scissor",
            "type": "string"
        },
        {
            "attribute": "mucus_extractor",
            "type": "string"
        },
        {
            "attribute": "cord_ligature",
            "type": "string"
        },
        {
            "attribute": "bag_and_mask",
            "type": "string"
        }
    ],
    "child_details": [
        {
            "attribute": "child_no",
            "type": "integer"
        },
        {
            "attribute": "gender",
            "type": "string"
        },
        {
            "attribute": "child_status",
            "type": "string"
        },
        {
            "attribute": "delivery_time",
            "type": "datetime"
        },
        {
            "attribute": "weight",
            "type": "integer"
        },
        {
            "attribute": "child_death_time",
            "type": "datetime"
        },
        {
            "attribute": "child_death_cause",
            "type": "string"
        },
        {
            "attribute": "child_death_cause_other",
            "type": "string"
        },
        {
            "attribute": "post_delivery_death",
            "type": "boolean"
        },
        {
            "attribute": "baby_cry",
            "type": "string"
        },
        {
            "attribute": "baby_need_resuscitation",
            "type": "string"
        },
        {
            "attribute": "oxygen_given",
            "type": "string"
        },
        {
            "attribute": "mucous_sucker_used",
            "type": "string"
        },
        {
            "attribute": "breastfeeding_within_one_hour",
            "type": "string"
        },
        {
            "attribute": "breastfeeding_time",
            "type": "datetime"
        },
        {
            "attribute": "pptct_treatment_given",
            "type": "string"
        },
        {
            "attribute": "congenital_anomaly",
            "type": "string"
        },
        {
            "attribute": "congenital_anomaly_other",
            "type": "string"
        },
        {
            "attribute": "immunization",
            "type": "string"
        },
        {
            "attribute": "apgar_score",
            "type": "string"
        },
        // {
        //     "attribute": "diarrhea",
        //     "type": "string"
        // },
        // {
        //     "attribute": "vomiting",
        //     "type": "string"
        // },
        // {
        //     "attribute": "convulsions",
        //     "type": "string"
        // },
        // {
        //     "attribute": "chest_indrawing",
        //     "type": "string"
        // },
        // {
        //     "attribute": "skin_pustules",
        //     "type": "string"
        // },
        {
            "attribute": "chord_length",
            "type": "string"
        },
        {
            "attribute": "complications",
            "type": "string"
        }
    ],
    "events": [
        {
            "attribute": "event",
            "type": "string"
        },
        {
            "attribute": "event_time",
            "type": "datetime"
        },
        {
            "attribute": "refer_message",
            "type": "string"
        },
        {
            "attribute": "refer_type",
            "type": "string"
        }
    ]
};