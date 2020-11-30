package com.elmakers.mine.bukkit.meta;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class MetaData {
    private Map<String, Category> categories = new HashMap<>();
    private Map<String, SpellActionDescription> actions = new HashMap<>();
    private Map<String, EffectDescription> effects = new HashMap<>();
    private ParameterStore parameterStore = new ParameterStore();

    @JsonProperty("categories")
    public Map<String, Category> getCategories() {
        return categories;
    }

    public void setCategories(Map<String, Category> categories) {
        this.categories = categories;
    }

    @JsonProperty("properties")
    public Map<String, Parameter> getParameters() {
        return parameterStore.getParameters();
    }

    public void setParameters(Map<String, Parameter> allParameters) {
        this.parameterStore.setParameters(allParameters);
    }

    @JsonProperty("action_classes")
    public Map<String, SpellActionDescription> getActions() {
        return actions;
    }

    public void setActions(Map<String, SpellActionDescription> actions) {
        this.actions = actions;
    }

    @JsonProperty("effectlib_classes")
    public Map<String, EffectDescription> getEffects() {
        return effects;
    }

    public void setEffects(Map<String, EffectDescription> effects) {
        this.effects = effects;
    }

    @JsonProperty("types")
    public Map<String, ParameterType> getTypes() {
        return parameterStore.getTypes();
    }

    public void setTypes(Map<String, ParameterType> types) {
        parameterStore.setTypes(types);
    }

    @JsonIgnore
    public ParameterStore getParameterStore() {
        return parameterStore;
    }

    public Category getCategory(String key) {
        Category category = categories.get(key);
        if (category == null) {
            category = new Category(key);
            categories.put(key, category);
        }
        return category;
    }

    public void addWandParameters(ParameterList parameters) {
        parameterStore.mergeType("wand_properties", parameters);
    }

    public void addClassParameters(ParameterList parameters) {
        parameterStore.mergeType("class_properties", parameters);
    }

    public void addModifierParameters(ParameterList parameters) {
        parameterStore.mergeType("modifier_properties", parameters);
    }

    public void addEffectLibParameters(ParameterList parameters) {
        parameterStore.mergeType("effectlib_properties", parameters);
    }

    public void addEffectParameters(ParameterList parameters) {
        parameterStore.mergeType("effect_properties", parameters);
    }

    public void addMobParameters(ParameterList parameters) {
        parameterStore.mergeType("mob_properties", parameters);
    }

    public void addActionParameters(ParameterList parameters) {
        parameterStore.mergeType("action_parameters", parameters);
    }

    public void addCompoundActionParameters(ParameterList parameters) {
        parameterStore.mergeType("compound_action_parameters", parameters);
    }

    public void addSpellParameters(ParameterList parameters) {
        parameterStore.mergeType("spell_parameters", parameters);
    }

    public void addSpellProperties(ParameterList parameters) {
        parameterStore.mergeType("spell_properties", parameters);
    }

    public Parameter getParameter(String key, Class<?> defaultClass) {
        return parameterStore.getParameter(key, defaultClass);
    }

    public void addEffect(String key, EffectDescription effect) {
        EffectDescription existing = effects.get(key);
        if (existing != null) {
            existing.merge(effect, parameterStore);
        } else {
            effects.put(key, effect);
        }
    }

    public void addAction(String key, SpellActionDescription action) {
        // Merge with existing actions
        SpellActionDescription existing = actions.get(key);
        if (existing != null) {
            existing.merge(action, parameterStore);
        } else {
            actions.put(key, action);
        }
    }

    public void update() {
        parameterStore.update();
    }

    public void loaded() {
        parameterStore.loaded();
        for (Map.Entry<String, Category> entry : categories.entrySet()) {
            entry.getValue().setKey(entry.getKey());
        }
        for (Map.Entry<String, SpellActionDescription> entry : actions.entrySet()) {
            entry.getValue().setKey(entry.getKey());
        }
        for (Map.Entry<String, EffectDescription> entry : effects.entrySet()) {
            entry.getValue().setKey(entry.getKey());
        }
    }
}
