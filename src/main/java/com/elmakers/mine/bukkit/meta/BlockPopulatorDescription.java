package com.elmakers.mine.bukkit.meta;

import javax.annotation.Nonnull;

import com.elmakers.mine.bukkit.world.populator.BaseBlockPopulator;

public class BlockPopulatorDescription extends Configurable {

    public BlockPopulatorDescription() {

    }

    public BlockPopulatorDescription(@Nonnull Class<? extends BaseBlockPopulator> populatorClass, @Nonnull ParameterList parameters) {
        super(populatorClass, parameters, "Populator");
    }
}
