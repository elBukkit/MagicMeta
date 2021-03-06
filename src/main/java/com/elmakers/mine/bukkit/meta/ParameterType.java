package com.elmakers.mine.bukkit.meta;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.Nonnull;

import org.apache.commons.lang.WordUtils;
import org.bukkit.configuration.ConfigurationSection;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ParameterType {
    private Class<?> classType;
    private Class<?> alternateClassType;
    private String key;
    private String name;
    private List<String> description;
    private Map<String, String> options;
    private Map<String, String> parameters;
    private String valueType;
    private String keyType;
    private String itemType;
    private String populateFrom;
    private String classed;

    public ParameterType() {

    }

    public ParameterType(@Nonnull String key, @Nonnull Class<?> classType) {
        this.key = key;
        this.classType = classType;
        description = new ArrayList<>();
        description.add("");
        options = new HashMap<>();
        name = WordUtils.capitalizeFully(key, new char[]{'_'}).replaceAll("_", " ");
    }

    public ParameterType(@Nonnull String key, ParameterType listValueType) {
        this(key, List.class);
        itemType = listValueType.getKey();
    }

    public ParameterType(@Nonnull String key, ParameterType mapKeyType, ParameterType mapValueType) {
        this(key,  Map.class);
        keyType = mapKeyType.getKey();
        valueType = mapValueType.getKey();
    }

    public ParameterType(@Nonnull String key) {
        this(key, ConfigurationSection.class);
        options = null;
        parameters = new HashMap<>();
    }

    @JsonIgnore
    public String getKey() {
        return this.key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    @JsonProperty("class_name")
    public String getClassName() {
        return this.classType.getName();
    }

    public void setClassName(String className) {
        try {
            classType = Class.forName(className);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public void setClassType(Class<?> classType) {
        this.classType = classType;
    }

    @JsonProperty("alternate_class_name")
    public String getAlternateClassName() {
        return alternateClassType == null ? null : this.alternateClassType.getName();
    }

    public void setAlternateClassName(String className) {
        try {
            alternateClassType = Class.forName(className);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private void addOption(String option) {
        if (!options.containsKey(option)) {
            options.put(option, null);
        }
    }

    public void update() {
        if (classType.isEnum()) {
            Object[] enums = classType.getEnumConstants();
            for (Object enumConstant : enums) {
                String enumKey = enumConstant.toString().toLowerCase();
                // Hack to avoid legacy materials
                if (enumKey.startsWith("legacy_")) continue;
                addOption(enumKey);
            }
        } else {
            // This covers PotionEffectType, which as it turns out is a huge pain.
            Field[] values = classType.getFields();
            for (Field field : values) {
                if (Modifier.isStatic(field.getModifiers())
                    && Modifier.isFinal(field.getModifiers())
                    && field.getType() == classType) {
                    addOption(field.getName().toLowerCase());
                }
            }
        }
    }

    public Map<String, String> getOptions() {
        return options;
    }

    public void setOptions(Map<String, String> options) {
        this.options = options;
    }

    public Map<String, String> getParameters() {
        return parameters;
    }

    public void setParameters(Map<String, String> parameters) {
        this.parameters = parameters;
    }

    public List<String> getDescription() {
        return description;
    }

    public void setDescription(List<String> description) {
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValueType() {
        return valueType;
    }

    @JsonProperty("value_type")
    public void setValueType(String valueType) {
        this.valueType = valueType;
    }

    public String getKeyType() {
        return keyType;
    }

    @JsonProperty("key_type")
    public void setKeyType(String keyType) {
        this.keyType = keyType;
    }

    @JsonProperty("item_type")
    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public String getItemType() {
        return itemType;
    }

    @JsonIgnore
    public Class<?> getClassType() {
        return classType;
    }

    @Override
    public String toString() {
        return key;
    }

    @JsonProperty("populate_from")
    public String getPopulateFrom() {
        return populateFrom;
    }

    public void setPopulateFrom(String populateFrom) {
        this.populateFrom = populateFrom;
    }

    public String getClassed() {
        return classed;
    }

    public void setClassed(String classed) {
        this.classed = classed;
    }
}
