package com.elmakers.mine.bukkit.meta;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ClassStore {
    private Map<String, SpellActionDescription> actions = new HashMap<>();
    private Map<String, EffectDescription> effects = new HashMap<>();

    public void loaded() {
        for (Map.Entry<String, SpellActionDescription> entry : actions.entrySet()) {
            entry.getValue().setKey(entry.getKey());
        }
        for (Map.Entry<String, EffectDescription> entry : effects.entrySet()) {
            entry.getValue().setKey(entry.getKey());
        }
    }

    public void addEffect(String key, EffectDescription effect, ParameterStore parameterStore) {
        EffectDescription existing = effects.get(key);
        if (existing != null) {
            existing.merge(effect, parameterStore);
        } else {
            effects.put(key, effect);
        }
    }

    public void addAction(String key, SpellActionDescription action, ParameterStore parameterStore) {
        // Merge with existing actions
        SpellActionDescription existing = actions.get(key);
        if (existing != null) {
            existing.merge(action, parameterStore);
        } else {
            actions.put(key, action);
        }
    }

    @JsonProperty("actions")
    public Map<String, SpellActionDescription> getActions() {
        return actions;
    }

    public void setActions(Map<String, SpellActionDescription> actions) {
        this.actions = actions;
    }

    @JsonProperty("effectlib_effects")
    public Map<String, EffectDescription> getEffects() {
        return effects;
    }

    public void setEffects(Map<String, EffectDescription> effects) {
        this.effects = effects;
    }

}
